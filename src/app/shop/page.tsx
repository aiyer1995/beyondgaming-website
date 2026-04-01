import { getProducts, getCategories, getSubcategoryIds } from "@/lib/woocommerce";
import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";

export const revalidate = 60;

interface ShopPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    orderby?: string;
    order?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const categoryId = params.category ? parseInt(params.category) : undefined;
  const orderby = params.orderby || "date";
  const order = params.order || "desc";

  const perPage = 12;
  let products: Awaited<ReturnType<typeof getProducts>>;
  let totalProducts: number;
  let topCategories: Awaited<ReturnType<typeof getCategories>>;

  if (categoryId && !search) {
    // Fetch categories + subcategories in parallel
    const [categories, subIds] = await Promise.all([
      getCategories(),
      getSubcategoryIds(categoryId),
    ]);
    topCategories = categories.filter((c) => c.parent === 0 && c.count > 0 && c.slug !== "uncategorized" && c.slug !== "grading" && c.slug !== "tcg-products-all-languages");

    const allCatIds = [categoryId, ...subIds];
    const results = await Promise.all(
      allCatIds.map((catId) =>
        getProducts({ per_page: 100, category: catId, orderby, order })
      )
    );
    const seen = new Set<number>();
    const merged = results.flat().filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
    if (orderby === "price") {
      merged.sort((a, b) => {
        const pa = parseFloat(a.price) || 0;
        const pb = parseFloat(b.price) || 0;
        return order === "asc" ? pa - pb : pb - pa;
      });
    } else if (orderby === "date") {
      merged.sort((a, b) =>
        order === "asc"
          ? new Date(a.date_created).getTime() - new Date(b.date_created).getTime()
          : new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
      );
    }
    totalProducts = merged.length;
    const start = (page - 1) * perPage;
    products = merged.slice(start, start + perPage);
  } else {
    // Fetch categories + products in parallel
    const [categories, allProducts] = await Promise.all([
      getCategories(),
      getProducts({
        search: search || undefined,
        category: categoryId,
        orderby,
        order,
      }),
    ]);
    topCategories = categories.filter((c) => c.parent === 0 && c.count > 0 && c.slug !== "uncategorized" && c.slug !== "grading" && c.slug !== "tcg-products-all-languages");
    totalProducts = allProducts.length;
    const start = (page - 1) * perPage;
    products = allProducts.slice(start, start + perPage);
  }

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { page: String(page), search, category: params.category, orderby, order, ...overrides };
    Object.entries(merged).forEach(([k, v]) => {
      if (v && v !== "1" && !(k === "orderby" && v === "date") && !(k === "order" && v === "desc")) {
        p.set(k, v);
      }
    });
    const qs = p.toString();
    return `/shop${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-500 mb-2">
          {search ? "Search Results" : "Our Collection"}
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900">
          {search ? (
            <>Results for &ldquo;<span className="text-gradient-purple">{search}</span>&rdquo;</>
          ) : (
            "All Products"
          )}
        </h1>
        {search && (
          <Link href="/shop" className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 font-medium mt-2 group">
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear search
          </Link>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-60 shrink-0">
          <div className="lg:sticky lg:top-36">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
              Categories
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/shop"
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${
                    !categoryId
                      ? "bg-purple-100 text-purple-700 font-bold shadow-sm"
                      : "text-gray-500 hover:bg-purple-50 hover:text-purple-600"
                  }`}
                >
                  All Products
                </Link>
              </li>
              {topCategories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={buildUrl({ category: String(cat.id), page: "1" })}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${
                      categoryId === cat.id
                        ? "bg-purple-100 text-purple-700 font-bold shadow-sm"
                        : "text-gray-500 hover:bg-purple-50 hover:text-purple-600"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-xs ${categoryId === cat.id ? "text-purple-500" : "text-gray-300"}`}>
                      {cat.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {/* Sort bar */}
          <div className="flex flex-wrap items-center justify-between mb-8 pb-5 border-b border-purple-100/50">
            <p className="text-sm text-gray-400 font-medium">
              Showing <span className="text-gray-700 font-semibold">{totalProducts}</span> products
            </p>
            <div className="flex items-center gap-1.5 mt-2 sm:mt-0">
              {[
                { label: "Newest", ob: "date", o: "desc" },
                { label: "Price: Low", ob: "price", o: "asc" },
                { label: "Price: High", ob: "price", o: "desc" },
                { label: "Popular", ob: "popularity", o: "desc" },
              ].map((s) => (
                <Link
                  key={s.label}
                  href={buildUrl({ orderby: s.ob, order: s.o, page: "1" })}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    orderby === s.ob && order === s.o
                      ? "bg-purple-700 text-white shadow-md shadow-purple-700/20"
                      : "bg-white text-gray-500 hover:bg-purple-50 hover:text-purple-600 border border-purple-100/50"
                  }`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          <ProductGrid products={products} columns={4} />

          {/* Pagination */}
          <div className="flex items-center justify-center gap-3 mt-12">
            {page > 1 && (
              <Link
                href={buildUrl({ page: String(page - 1) })}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-700 text-white text-sm font-bold hover:bg-purple-800 shadow-md shadow-purple-700/20 transition-all hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </Link>
            )}
            <span className="px-5 py-2.5 text-sm text-gray-400 font-semibold bg-white rounded-xl border border-purple-100/50">
              Page {page}
            </span>
            {page * perPage < totalProducts && (
              <Link
                href={buildUrl({ page: String(page + 1) })}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-700 text-white text-sm font-bold hover:bg-purple-800 shadow-md shadow-purple-700/20 transition-all hover:scale-105"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
