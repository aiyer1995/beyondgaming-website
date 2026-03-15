import { getProduct, getRelatedProducts } from "@/lib/woocommerce";
import { formatPrice, getStockLabel, stripHtml } from "@/lib/utils";
import ProductGrid from "@/components/ProductGrid";
import AddToCartButton from "@/components/AddToCartButton";
import ProductImageGallery from "@/components/ProductImageGallery";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const stock = getStockLabel(product.stock_status, product.stock_quantity);
  const related = await getRelatedProducts(product.related_ids);
  const isGrading = product.categories.some((c) => c.slug === "grading");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8 font-medium">
        <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <Link href="/shop" className="hover:text-purple-600 transition-colors">Shop</Link>
        {product.categories[0] && (
          <>
            <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <Link href={`/category/${product.categories[0].slug}`} className="hover:text-purple-600 transition-colors">
              {product.categories[0].name}
            </Link>
          </>
        )}
        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-600 line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <ProductImageGallery images={product.images} productName={product.name} />

        {/* Product Info */}
        <div>
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-4">
            {product.categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="text-[10px] font-bold uppercase tracking-wider bg-purple-100/80 text-purple-600 px-3 py-1 rounded-lg hover:bg-purple-200 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
            {product.name}
          </h1>

          {/* Price */}
          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-4xl font-black text-gradient-purple">
              {formatPrice(product.price)}
            </span>
            {product.on_sale && product.regular_price && (
              <span className="text-lg text-gray-300 line-through font-medium">
                {formatPrice(product.regular_price)}
              </span>
            )}
            {product.on_sale && (
              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-md shadow-red-500/20">
                Sale
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="mt-4 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${product.stock_status === "instock" ? "bg-green-400" : "bg-red-400"}`} />
            <span className={`text-sm font-semibold ${stock.color}`}>
              {stock.text}
            </span>
            {product.stock_quantity !== null && product.stock_status === "instock" && (
              <span className="text-xs text-gray-300 ml-1">
                ({product.stock_quantity} left)
              </span>
            )}
          </div>

          {/* Short description */}
          {product.short_description && (
            <div
              className="mt-6 text-gray-500 text-sm leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.short_description }}
            />
          )}

          {/* Add to Cart */}
          <div className="mt-8">
            <AddToCartButton product={product} isGrading={isGrading} />
          </div>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { icon: "\uD83D\uDEE1\uFE0F", text: "100% Authentic" },
              { icon: "\u26A1", text: "Ships in 1-3 Days" },
              { icon: "\uD83D\uDD12", text: "Secure Payment" },
            ].map((badge) => (
              <div key={badge.text} className="text-center p-3 bg-purple-50/70 rounded-xl border border-purple-100/50">
                <span className="text-lg">{badge.icon}</span>
                <p className="text-[10px] font-semibold text-gray-500 mt-1">{badge.text}</p>
              </div>
            ))}
          </div>

          {/* Meta info */}
          <div className="mt-8 border-t border-purple-100/50 pt-6 space-y-2">
            {product.sku && (
              <p className="text-xs text-gray-400">
                <span className="font-semibold text-gray-500">SKU:</span> {product.sku}
              </p>
            )}
            <p className="text-xs text-gray-400">
              <span className="font-semibold text-gray-500">Categories:</span>{" "}
              {product.categories.map((c) => c.name).join(", ")}
            </p>
          </div>
        </div>
      </div>

      {/* Full description */}
      {product.description && stripHtml(product.description).length > 0 && (
        <div className="mt-16 bg-white rounded-3xl border border-purple-100/50 p-8">
          <h2 className="text-xl font-black text-gray-900 mb-4">Description</h2>
          <div
            className="prose prose-sm max-w-none text-gray-500"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-20">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-500 mb-2">
              More To Explore
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">
              You May Also Like
            </h2>
          </div>
          <ProductGrid products={related} columns={4} />
        </div>
      )}
    </div>
  );
}
