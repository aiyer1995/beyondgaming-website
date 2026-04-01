import { NextRequest, NextResponse } from "next/server";
import { createOrder, getProductById } from "@/lib/woocommerce";
import { Redis } from "@upstash/redis";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// Rate limit: max 3 orders per 10 minutes per IP
async function checkRateLimit(ip: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return true;
  try {
    const key = `ratelimit:checkout:${ip}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 600);
    return count <= 3;
  } catch {
    return true; // Allow if Redis fails
  }
}

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
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const allowed = await checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many orders. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Fetch products for stock check and weight calculation
    const lineItems: { product_id: number; quantity: number }[] = body.line_items;
    let totalWeight = 0;
    try {
      const products = await Promise.all(
        lineItems.map((item) => getProductById(item.product_id).catch(() => null))
      );

      // Check stock availability
      const oosNames: string[] = [];
      for (let i = 0; i < lineItems.length; i++) {
        const p = products[i];
        if (p && p.stock_status !== "instock") {
          oosNames.push(p.name);
        } else if (p && p.manage_stock && p.stock_quantity !== null && p.stock_quantity < lineItems[i].quantity) {
          oosNames.push(p.name);
        }
      }
      if (oosNames.length > 0) {
        return NextResponse.json(
          { error: `One or more products are out of stock: ${oosNames.join(", ")}. Please update your cart and try again.` },
          { status: 400 }
        );
      }

      for (let i = 0; i < lineItems.length; i++) {
        const p = products[i];
        const weight = p ? parseFloat(p.weight) || 0.5 : 0.5;
        totalWeight += weight * lineItems[i].quantity;
      }
    } catch {
      // Fallback: estimate 0.5kg per item, skip stock check
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
