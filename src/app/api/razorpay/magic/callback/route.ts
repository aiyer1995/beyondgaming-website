import { NextRequest, NextResponse } from "next/server";
import {
  razorpayClient,
  verifyPaymentSignature,
  parseCartSnapshot,
  createMagicWcOrder,
  type MagicAddress,
} from "@/lib/magicCheckout";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Razorpay Magic Checkout redirects here after a successful payment with
 * `redirect: "true"`. The body arrives as form-encoded data containing
 * razorpay_payment_id, razorpay_order_id, razorpay_signature, and (for 1CC)
 * the customer's address fields.
 *
 * Flow:
 *   1. Read form data
 *   2. Verify the signature (rejects spoofed callbacks)
 *   3. Fetch the Razorpay order to recover the cart snapshot from notes
 *   4. Idempotently create the WC order with status=processing
 *   5. Redirect the user to /order-confirmation
 *
 * The webhook route is the safety net for the case where the user closes
 * the browser before this redirect completes.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const origin = new URL(req.url).origin;

  try {
    const formData = await req.formData();
    const fields: Record<string, string> = {};
    formData.forEach((value, key) => {
      fields[key] = String(value);
    });

    const razorpay_payment_id = fields.razorpay_payment_id;
    const razorpay_order_id = fields.razorpay_order_id;
    const razorpay_signature = fields.razorpay_signature;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.redirect(
        `${origin}/checkout?error=magic_missing_fields`,
        303
      );
    }

    if (
      !verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      )
    ) {
      console.error("Magic Checkout: invalid signature", {
        razorpay_payment_id,
        razorpay_order_id,
      });
      return NextResponse.redirect(
        `${origin}/checkout?error=magic_signature`,
        303
      );
    }

    // Recover cart snapshot from order notes (set in create-order)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rzpOrder = (await razorpayClient.orders.fetch(razorpay_order_id)) as any;
    const cartSnapshot: string | undefined = rzpOrder?.notes?.cart;
    const shippingPaise = Number(rzpOrder?.notes?.shipping_paise || 0);
    const cartItems = parseCartSnapshot(cartSnapshot);

    if (cartItems.length === 0) {
      console.error("Magic Checkout: empty cart snapshot", {
        razorpay_order_id,
        notes: rzpOrder?.notes,
      });
      return NextResponse.redirect(
        `${origin}/checkout?error=magic_cart_lost`,
        303
      );
    }

    // Address fields — Magic Checkout sends these in the form post for 1CC.
    // Field names defensive: try multiple plausible variants.
    const address: MagicAddress = readAddressFromForm(fields);

    const result = await createMagicWcOrder({
      razorpay_payment_id,
      razorpay_order_id,
      cartItems,
      address,
      shippingPaise,
    });

    const wcOrderId =
      "id" in result ? result.id : result.existingOrderId;

    return NextResponse.redirect(
      `${origin}/order-confirmation?id=${wcOrderId}`,
      303
    );
  } catch (err) {
    console.error("Magic Checkout callback error:", err);
    return NextResponse.redirect(
      `${origin}/checkout?error=magic_callback_failed`,
      303
    );
  }
}

// Some Razorpay setups send a GET callback instead of POST — handle both.
export async function GET(req: NextRequest): Promise<NextResponse> {
  const origin = new URL(req.url).origin;
  const url = new URL(req.url);
  const razorpay_payment_id = url.searchParams.get("razorpay_payment_id");
  const razorpay_order_id = url.searchParams.get("razorpay_order_id");
  const razorpay_signature = url.searchParams.get("razorpay_signature");

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return NextResponse.redirect(`${origin}/checkout?error=magic_missing_fields`, 303);
  }

  // Re-use the POST handler by building a synthetic form request
  const form = new FormData();
  url.searchParams.forEach((value, key) => form.append(key, value));
  const synthetic = new Request(req.url, { method: "POST", body: form });
  return POST(synthetic as NextRequest);
}

function readAddressFromForm(fields: Record<string, string>): MagicAddress {
  const pick = (...keys: string[]): string => {
    for (const k of keys) {
      if (fields[k] && fields[k].trim()) return fields[k].trim();
    }
    return "";
  };

  const fullName = pick("name", "customer_name", "shipping_name");
  const [first, ...rest] = fullName.split(" ");

  return {
    first_name: pick("first_name") || first || "Customer",
    last_name: pick("last_name") || rest.join(" ") || "",
    email: pick("email", "customer_email"),
    contact: pick("contact", "phone", "customer_contact"),
    address_1: pick("line1", "address_line1", "address_1", "shipping_address_line1"),
    address_2: pick("line2", "address_line2", "address_2", "shipping_address_line2"),
    city: pick("city", "shipping_city"),
    state: pick("state", "shipping_state"),
    postcode: pick("zipcode", "postcode", "pincode", "shipping_zipcode"),
    country: pick("country", "shipping_country") || "IN",
  };
}
