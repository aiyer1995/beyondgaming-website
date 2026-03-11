import { NextResponse } from "next/server";
import { getCustomerOrders } from "@/lib/woocommerce";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const customerId = await getSession();
    if (!customerId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const orders = await getCustomerOrders(customerId);
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
