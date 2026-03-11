import { NextRequest, NextResponse } from "next/server";
import { verifyCustomerLogin, getCustomer } from "@/lib/woocommerce";
import { setSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email/username and password required" }, { status: 400 });
    }

    const result = await verifyCustomerLogin(email, password);
    if (!result) {
      return NextResponse.json({ error: "Invalid email/username or password" }, { status: 401 });
    }

    await setSession(result.customer_id);

    const customer = await getCustomer(result.customer_id);
    return NextResponse.json({
      id: customer.id,
      email: customer.email,
      first_name: customer.first_name,
      last_name: customer.last_name,
    });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
