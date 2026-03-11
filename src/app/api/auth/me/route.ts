import { NextResponse } from "next/server";
import { getCustomer } from "@/lib/woocommerce";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const customerId = await getSession();
    if (!customerId) {
      return NextResponse.json({ customer: null });
    }

    const customer = await getCustomer(customerId);
    return NextResponse.json({
      customer: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        billing: customer.billing,
        shipping: customer.shipping,
      },
    });
  } catch {
    return NextResponse.json({ customer: null });
  }
}
