import { getProducts, getCategoryBySlug, getSubcategoryIds } from "@/lib/woocommerce";
import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; orderby?: string; order?: string }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = parseInt(sp.page || "1");
  const orderby = sp.orderby || "date";
  const order = sp.order || "desc";

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  // Get subcategory IDs so we include products from child categories too
  const subIds = await getSubcategoryIds(category.id);
  const allCatIds = [category.id, ...subIds];

  // Fetch products from parent + all subcategories in parallel, then merge & dedupe
  const allResults = await Promise.all(
    allCatIds.map((catId) =>
      getProducts({ per_page: 100, category: catId, orderby, order })
    )
  );
  const seen = new Set<number>();
  const allProducts = allResults.flat().filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  // Sort merged results
  if (orderby === "price") {
    allProducts.sort((a, b) => {
      const pa = parseFloat(a.price) || 0;
      const pb = parseFloat(b.price) || 0;
      return order === "asc" ? pa - pb : pb - pa;
    });
  } else {
    allProducts.sort((a, b) => {
      return order === "asc"
        ? new Date(a.date_created).getTime() - new Date(b.date_created).getTime()
        : new Date(b.date_created).getTime() - new Date(a.date_created).getTime();
    });
  }

  // Paginate
  const perPage = 12;
  const start = (page - 1) * perPage;
  const products = allProducts.slice(start, start + perPage);

  const buildUrl = (overrides: Record<string, string>) => {
    const p = new URLSearchParams();
    const merged = { page: String(page), orderby, order, ...overrides };
    Object.entries(merged).forEach(([k, v]) => {
      if (v && v !== "1" && !(k === "orderby" && v === "date") && !(k === "order" && v === "desc")) {
        p.set(k, v);
      }
    });
    const qs = p.toString();
    return `/category/${slug}${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-purple-600">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-purple-600">Shop</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{category.name}</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
      {category.description && (
        <p className="text-gray-500 mb-6">{category.description}</p>
      )}

      {/* Sort bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <p className="text-sm text-gray-500">{allProducts.length} products</p>
        <div className="flex gap-1">
          {[
            { label: "Newest", ob: "date", o: "desc" },
            { label: "Price: Low", ob: "price", o: "asc" },
            { label: "Price: High", ob: "price", o: "desc" },
          ].map((s) => (
            <Link
              key={s.label}
              href={buildUrl({ orderby: s.ob, order: s.o, page: "1" })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                orderby === s.ob && order === s.o
                  ? "bg-purple-700 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      <ProductGrid products={products} columns={4} />

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-10">
        {page > 1 && (
          <Link
            href={buildUrl({ page: String(page - 1) })}
            className="px-4 py-2 rounded-lg bg-purple-700 text-white text-sm font-medium hover:bg-purple-800"
          >
            Previous
          </Link>
        )}
        <span className="px-4 py-2 text-sm text-gray-500">Page {page}</span>
        {start + perPage < allProducts.length && (
          <Link
            href={buildUrl({ page: String(page + 1) })}
            className="px-4 py-2 rounded-lg bg-purple-700 text-white text-sm font-medium hover:bg-purple-800"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
