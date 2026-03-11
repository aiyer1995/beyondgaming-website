import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, orderNumber, cards } = body;

    if (!firstName || !lastName || !email || !phone || !orderNumber) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json(
        { error: "At least one card is required" },
        { status: 400 }
      );
    }

    for (const card of cards) {
      if (!card.cardName || !card.category) {
        return NextResponse.json(
          { error: "Each card must have a name and category" },
          { status: 400 }
        );
      }
    }

    const wpUrl = `${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/bg/v1/grading-submissions`;
    const res = await fetch(wpUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        order_number: orderNumber,
        cards,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to submit");
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    console.error("Grading submission error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Submission failed" },
      { status: 500 }
    );
  }
}
