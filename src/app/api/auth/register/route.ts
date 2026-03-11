import { NextRequest, NextResponse } from "next/server";
import { createCustomer } from "@/lib/woocommerce";
import { setSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const customer = await createCustomer({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      username: email,
    });

    await setSession(customer.id);

    return NextResponse.json({
      id: customer.id,
      email: customer.email,
      first_name: customer.first_name,
      last_name: customer.last_name,
    });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("400")
      ? "An account with this email already exists"
      : "Registration failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
