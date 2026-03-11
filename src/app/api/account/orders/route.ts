import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

const BASE_URL = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL!;
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET!;

export async function GET() {
  try {
    const customerId = await getSession();
    if (!customerId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const url = new URL(`${BASE_URL}/wp-json/wc/v3/orders`);
    url.searchParams.set("consumer_key", CONSUMER_KEY);
    url.searchParams.set("consumer_secret", CONSUMER_SECRET);
    url.searchParams.set("customer", String(customerId));
    url.searchParams.set("per_page", "20");

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch orders");
    const orders = await res.json();

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
