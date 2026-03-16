import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL!;
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const url = new URL(`${BASE_URL}/wp-json/wc/v3/coupons`);
    url.searchParams.set("consumer_key", CONSUMER_KEY);
    url.searchParams.set("consumer_secret", CONSUMER_SECRET);
    url.searchParams.set("code", code.trim());

    const res = await fetch(url.toString(), { cache: "no-store" });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
    }

    const coupons = await res.json();

    if (!coupons.length) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    }

    const coupon = coupons[0];

    // Check if coupon has expired
    if (coupon.date_expires) {
      const expiryDate = new Date(coupon.date_expires);
      if (expiryDate < new Date()) {
        return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
      }
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
    }

    return NextResponse.json({
      code: coupon.code,
      discount_type: coupon.discount_type,
      amount: coupon.amount,
      description: coupon.description,
      minimum_amount: coupon.minimum_amount,
      maximum_amount: coupon.maximum_amount,
      product_ids: coupon.product_ids,
      excluded_product_ids: coupon.excluded_product_ids,
      product_categories: coupon.product_categories,
      excluded_product_categories: coupon.excluded_product_categories,
      free_shipping: coupon.free_shipping,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
