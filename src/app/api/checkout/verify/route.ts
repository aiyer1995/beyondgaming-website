import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const BASE_URL = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL!;
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, wc_order_id } =
      await request.json();

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Mark WooCommerce order as paid
    const url = new URL(`${BASE_URL}/wp-json/wc/v3/orders/${wc_order_id}`);
    url.searchParams.set("consumer_key", CONSUMER_KEY);
    url.searchParams.set("consumer_secret", CONSUMER_SECRET);

    await fetch(url.toString(), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        set_paid: true,
        status: "processing",
        transaction_id: razorpay_payment_id,
        payment_method: "razorpay",
        payment_method_title: "Razorpay",
      }),
    });

    return NextResponse.json({ success: true, order_id: wc_order_id });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Verification failed" },
      { status: 500 }
    );
  }
}
