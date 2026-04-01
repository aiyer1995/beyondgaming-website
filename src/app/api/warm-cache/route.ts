import { NextRequest, NextResponse } from "next/server";
import { getProducts, getCategories, getSubcategoryIds } from "@/lib/woocommerce";

const WARM_SECRET = process.env.REVALIDATE_SECRET;

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (WARM_SECRET && secret !== WARM_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  try {
    const start = Date.now();

    // Warm the most critical caches in parallel
    const [allProducts, categories] = await Promise.all([
      getProducts({ orderby: "date", order: "desc" }),
      getCategories(),
    ]);

    // Warm category pages in parallel
    const topCategories = categories.filter((c) => c.parent === 0 && c.count > 0 && c.slug !== "uncategorized");
    await Promise.all(
      topCategories.map(async (cat) => {
        const subIds = await getSubcategoryIds(cat.id);
        const allCatIds = [cat.id, ...subIds];
        await Promise.all(
          allCatIds.map((catId) => getProducts({ per_page: 100, category: catId }))
        );
      })
    );

    const duration = Date.now() - start;

    return NextResponse.json({
      success: true,
      products_cached: allProducts.length,
      categories_cached: topCategories.length,
      duration_ms: duration,
    });
  } catch (error) {
    console.error("Cache warming error:", error);
    return NextResponse.json({ error: "Cache warming failed" }, { status: 500 });
  }
}
