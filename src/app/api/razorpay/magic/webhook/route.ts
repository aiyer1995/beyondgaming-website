import { NextRequest, NextResponse } from "next/server";
import {
  razorpayClient,
  verifyWebhookSignature,
  parseCartSnapshot,
  createMagicWcOrder,
  getRecordedWcOrderId,
  type MagicAddress,
} from "@/lib/magicCheckout";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Razorpay webhook safety net for Magic Checkout. Configured in the Razorpay
 * dashboard against this URL with secret `RAZORPAY_WEBHOOK_SECRET`.
 *
 * Listens for `payment.captured` (and optionally `order.paid`) and creates
 * the WooCommerce order if the user-redirect callback never ran (e.g. user
 * closed the browser mid-payment). Idempotent: if the callback already
 * created the WC order, this is a no-op.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn("Magic Checkout webhook: invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType: string = event?.event || "";
  if (eventType !== "payment.captured" && eventType !== "order.paid") {
    // Acknowledge so Razorpay doesn't retry
    return NextResponse.json({ ok: true, ignored: eventType });
  }

  try {
    const payment = event?.payload?.payment?.entity;
    if (!payment) {
      return NextResponse.json({ ok: true, ignored: "no payment entity" });
    }

    const razorpay_payment_id: string = payment.id;
    const razorpay_order_id: string = payment.order_id;

    if (!razorpay_payment_id || !razorpay_order_id) {
      return NextResponse.json({ error: "Missing payment/order id" }, { status: 400 });
    }

    // Skip if callback already handled this payment
    if (getRecordedWcOrderId(razorpay_payment_id)) {
      return NextResponse.json({ ok: true, deduped: true });
    }

    // Only handle Magic Checkout flow orders (not the legacy /api/checkout
    // ones, which already have their own success path)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rzpOrder = (await razorpayClient.orders.fetch(razorpay_order_id)) as any;
    if (rzpOrder?.notes?.flow !== "magic_v1") {
      return NextResponse.json({ ok: true, ignored: "non-magic order" });
    }

    const cartItems = parseCartSnapshot(rzpOrder?.notes?.cart);
    const shippingPaise = Number(rzpOrder?.notes?.shipping_paise || 0);
    if (cartItems.length === 0) {
      console.error("Magic Checkout webhook: empty cart snapshot", {
        razorpay_order_id,
      });
      return NextResponse.json({ error: "Cart snapshot missing" }, { status: 400 });
    }

    // Pull address from payment notes / customer details. The webhook payload
    // has slightly different shape than the redirect form — fetch payment for
    // full details.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fullPayment = (await razorpayClient.payments.fetch(razorpay_payment_id)) as any;
    const address: MagicAddress = readAddressFromPayment(fullPayment, rzpOrder);

    const result = await createMagicWcOrder({
      razorpay_payment_id,
      razorpay_order_id,
      cartItems,
      address,
      shippingPaise,
    });

    const wcOrderId = "id" in result ? result.id : result.existingOrderId;
    return NextResponse.json({ ok: true, wc_order_id: wcOrderId });
  } catch (err) {
    console.error("Magic Checkout webhook error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function readAddressFromPayment(payment: any, order: any): MagicAddress {
  // Razorpay attaches customer/shipping details in different places depending
  // on the integration. Try the most common ones in order.
  const shipping =
    payment?.shipping_address ||
    payment?.shipping_details ||
    order?.shipping_address ||
    {};
  const customer =
    payment?.customer_details ||
    payment?.notes ||
    order?.customer_details ||
    {};

  const fullName = String(
    shipping.name || customer.name || customer.shipping_name || ""
  );
  const [first, ...rest] = fullName.split(" ");

  return {
    first_name: shipping.first_name || customer.first_name || first || "Customer",
    last_name: shipping.last_name || customer.last_name || rest.join(" ") || "",
    email: payment.email || customer.email || "",
    contact: payment.contact || customer.contact || "",
    address_1: shipping.line1 || shipping.address_1 || "",
    address_2: shipping.line2 || shipping.address_2 || "",
    city: shipping.city || "",
    state: shipping.state || "",
    postcode: shipping.zipcode || shipping.pincode || shipping.postcode || "",
    country: shipping.country || "IN",
  };
}
