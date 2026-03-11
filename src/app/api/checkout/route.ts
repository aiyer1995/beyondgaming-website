import { NextRequest, NextResponse } from "next/server";
import { createOrder, getProductById } from "@/lib/woocommerce";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

function calculateShipping(totalWeightKg: number): number {
  // Base: ₹150 for up to 1kg
  // Over 1kg: ₹65 per 0.6kg increment
  // Capped at ₹500
  let cost = 150;
  if (totalWeightKg > 1) {
    const extraWeight = totalWeightKg - 1;
    const increments = Math.ceil(extraWeight / 0.6);
    cost += increments * 65;
  }
  return Math.min(cost, 500);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Fetch product weights to calculate shipping
    const lineItems: { product_id: number; quantity: number }[] = body.line_items;
    const products = await Promise.all(
      lineItems.map((item) => getProductById(item.product_id))
    );

    let totalWeight = 0;
    for (let i = 0; i < lineItems.length; i++) {
      const weight = parseFloat(products[i].weight) || 0;
      totalWeight += weight * lineItems[i].quantity;
    }

    const shippingCost = calculateShipping(totalWeight);

    // Add shipping line to WC order
    const orderPayload = {
      ...body,
      shipping_lines: [
        {
          method_id: "flat_rate",
          method_title: "Shipping",
          total: shippingCost.toFixed(2),
        },
      ],
    };

    const order = await createOrder(orderPayload);

    // Create Razorpay order with total (includes shipping)
    const amountInPaise = Math.round(parseFloat(order.total) * 100);
    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `wc_order_${order.id}`,
      notes: {
        wc_order_id: String(order.id),
      },
    });

    return NextResponse.json({
      wc_order_id: order.id,
      wc_order_key: order.order_key,
      razorpay_order_id: rzpOrder.id,
      amount: amountInPaise,
      currency: "INR",
      shipping_total: shippingCost.toFixed(2),
      shipping_method: "Shipping",
      order_total: order.total,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create order" },
      { status: 500 }
    );
  }
}
