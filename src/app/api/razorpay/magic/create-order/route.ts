import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getProductById } from "@/lib/woocommerce";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

interface IncomingItem {
  product_id: number;
  quantity: number;
  add_ons?: { name: string; price: number }[];
}

function calculateShippingPaise(totalWeightKg: number): number {
  let cost = 150;
  if (totalWeightKg > 1) {
    const increments = Math.ceil((totalWeightKg - 1) / 0.6);
    cost += increments * 65;
  }
  return Math.min(cost, 500) * 100;
}

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: IncomingItem[] = body.items || [];

    if (items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Fetch product details for stock check + accurate pricing (server-side
    // truth, not client-supplied prices)
    const products = await Promise.all(
      items.map((it) => getProductById(it.product_id).catch(() => null))
    );

    const oosNames: string[] = [];
    let lineItemsTotalPaise = 0;
    let totalWeightKg = 0;

    for (let i = 0; i < items.length; i++) {
      const p = products[i];
      const item = items[i];
      if (!p) {
        return NextResponse.json(
          { error: `Product ${item.product_id} not found` },
          { status: 400 }
        );
      }

      if (p.stock_status !== "instock") {
        oosNames.push(p.name);
        continue;
      }
      if (
        p.manage_stock &&
        p.stock_quantity !== null &&
        p.stock_quantity < item.quantity
      ) {
        oosNames.push(p.name);
        continue;
      }

      const productPaise = Math.round(parseFloat(p.price) * 100);
      const addOnsPaise = (item.add_ons || []).reduce(
        (sum, a) => sum + Math.round(a.price * 100),
        0
      );
      const unitPaise = productPaise + addOnsPaise;
      lineItemsTotalPaise += unitPaise * item.quantity;

      const weight = parseFloat(p.weight) || 0.5;
      totalWeightKg += weight * item.quantity;
    }

    if (oosNames.length > 0) {
      return NextResponse.json(
        {
          error: `Out of stock: ${oosNames.join(", ")}. Update your cart and try again.`,
        },
        { status: 400 }
      );
    }

    const shippingPaise = calculateShippingPaise(totalWeightKg);
    const totalAmountPaise = lineItemsTotalPaise + shippingPaise;

    // Compact cart snapshot we can recover from order notes during the
    // callback. Format: "id:qty,id:qty" — fits inside Razorpay's 256-char
    // value limit for typical carts. Add-on names skipped for brevity; if
    // you need them in the WC order, store the cart in Redis instead.
    const cartSnapshot = items
      .map((it) => `${it.product_id}:${it.quantity}`)
      .join(",")
      .slice(0, 250);

    const order = await razorpay.orders.create({
      amount: totalAmountPaise,
      currency: "INR",
      receipt: `magic_${Date.now()}`,
      notes: {
        cart: cartSnapshot,
        flow: "magic_v1",
        shipping_paise: String(shippingPaise),
        line_items_paise: String(lineItemsTotalPaise),
      },
    });

    return NextResponse.json({
      order_id: order.id,
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: totalAmountPaise,
      currency: "INR",
    });
  } catch (err) {
    console.error("Magic Checkout create-order error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to create Magic Checkout order",
      },
      { status: 500 }
    );
  }
}
