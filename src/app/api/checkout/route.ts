import { NextRequest, NextResponse } from "next/server";
import { createOrder, getProductById } from "@/lib/woocommerce";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

function calculateShipping(totalWeightKg: number): number {
  let cost = 150;
  if (totalWeightKg > 1) {
    const extraWeight = totalWeightKg - 1;
    const increments = Math.ceil(extraWeight / 0.6);
    cost += increments * 65;
  }
  return Math.min(cost, 500);
}

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Fetch product weights — fallback to 0.5kg per item if API fails
    const lineItems: { product_id: number; quantity: number }[] = body.line_items;
    let totalWeight = 0;
    try {
      const products = await Promise.all(
        lineItems.map((item) => getProductById(item.product_id).catch(() => null))
      );
      for (let i = 0; i < lineItems.length; i++) {
        const p = products[i];
        const weight = p ? parseFloat(p.weight) || 0.5 : 0.5;
        totalWeight += weight * lineItems[i].quantity;
      }
    } catch {
      // Fallback: estimate 0.5kg per item
      totalWeight = lineItems.reduce((sum, item) => sum + 0.5 * item.quantity, 0);
    }

    const shippingCost = calculateShipping(totalWeight);

    const feeLines = (body.fee_lines || []).map((fee: { name: string; total: string }) => ({
      name: fee.name,
      total: fee.total,
    }));

    const couponLines = (body.coupon_lines || []).map((c: { code: string }) => ({
      code: c.code,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderPayload: any = {
      payment_method: body.payment_method,
      payment_method_title: body.payment_method_title,
      set_paid: body.set_paid,
      billing: body.billing,
      shipping: body.shipping,
      line_items: body.line_items,
      shipping_lines: [
        {
          method_id: "flat_rate",
          method_title: "Shipping",
          total: shippingCost.toFixed(2),
        },
      ],
      fee_lines: feeLines,
    };
    if (body.customer_id) orderPayload.customer_id = body.customer_id;
    if (couponLines.length > 0) orderPayload.coupon_lines = couponLines;

    // Create WC order with one retry
    let order;
    try {
      order = await createOrder(orderPayload);
    } catch (err) {
      console.error("First order attempt failed, retrying:", err);
      order = await createOrder(orderPayload);
    }

    // Create Razorpay order
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
      { error: "Order could not be placed. Please try again. If the issue persists, contact us on WhatsApp." },
      { status: 500 }
    );
  }
}
