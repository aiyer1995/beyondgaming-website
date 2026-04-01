import { NextRequest, NextResponse } from "next/server";
import { getProducts, getCategories } from "@/lib/woocommerce";

const WARM_SECRET = process.env.REVALIDATE_SECRET;

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (WARM_SECRET && secret !== WARM_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  try {
    const start = Date.now();

    // Warm master product list + categories (just 2 cache entries)
    const [products, categories] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);

    return NextResponse.json({
      success: true,
      products: products.length,
      categories: categories.length,
      duration_ms: Date.now() - start,
    });
  } catch (error) {
    console.error("Cache warming error:", error);
    return NextResponse.json({ error: "Cache warming failed" }, { status: 500 });
  }
}
