import HeroBanner from "@/components/HeroBanner";
import CategoryCard from "@/components/CategoryCard";
import ProductGrid from "@/components/ProductGrid";
import { getProducts } from "@/lib/woocommerce";
import Link from "next/link";

export const revalidate = 60;

const FEATURED_CATEGORIES = [
  { name: "Pokemon", slug: "pokemon-tcg-products", gradient: "from-yellow-400 via-amber-400 to-orange-500", emoji: "\u26A1", image: "/images/cat-pokemon.png" },
  { name: "One Piece", slug: "one-piece-tcg", gradient: "from-red-500 via-red-600 to-rose-700", emoji: "\u2693", image: "/images/cat-onepiece.png" },
  { name: "Dragon Ball", slug: "dragonball-tcg", gradient: "from-orange-400 via-orange-500 to-amber-600", emoji: "\uD83D\uDD25", image: "/images/cat-dragonball.png" },
  { name: "Supplies", slug: "supplies", gradient: "from-emerald-400 via-emerald-500 to-teal-600", emoji: "\uD83D\uDEE1\uFE0F", image: "/images/cat-supplies.png" },
  { name: "Collectibles", slug: "toys-collectibles", gradient: "from-pink-400 via-fuchsia-500 to-purple-600", emoji: "\u2728", image: "/images/cat-collectibles.png" },
  { name: "Graded Slabs", slug: "graded-slabs", gradient: "from-indigo-500 via-purple-600 to-violet-700", emoji: "\uD83C\uDFC6", image: "/images/cat-graded.png" },
];

export default async function HomePage() {
  // Fetch 100 to match Shop page, then take the first 15 after filtering
  const allProducts = await getProducts({ per_page: 100, orderby: "date", order: "desc" });
  const newArrivals = allProducts.slice(0, 15);

  return (
    <>
      <HeroBanner />

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-500 mb-2">
            Browse Collections
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900">
            Shop By <span className="text-gradient-purple">Fandom</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5 stagger-children">
          {FEATURED_CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.slug}
              name={cat.name}
              slug={cat.slug}
              gradient={cat.gradient}
              emoji={cat.emoji}
              image={cat.image}
            />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50/50 to-white" />
        <div className="absolute top-0 left-1/2 w-[800px] h-[400px] -translate-x-1/2 -translate-y-1/2 bg-purple-200/20 rounded-full blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-500 mb-2">
                Just Dropped
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold text-sm bg-purple-50 hover:bg-purple-100 px-5 py-2.5 rounded-xl transition-all"
            >
              View All
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="stagger-children">
            <ProductGrid products={newArrivals} columns={5} />
          </div>
        </div>
      </section>

      {/* Trust / Features */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-[#1a0030] rounded-3xl p-8 md:p-12 relative overflow-hidden noise">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-[60px]" />

          <div className="relative">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-white">
                Why Choose <span className="text-gradient-gold">Beyond Gaming</span>?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  title: "100% Authentic",
                  desc: "Every product is genuine, officially licensed, and sourced from authorized distributors.",
                },
                {
                  icon: (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                  title: "Lightning Fast Shipping",
                  desc: "All orders shipped within 1-3 business days with tracking. Pan-India delivery.",
                },
                {
                  icon: (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ),
                  title: "Secure Payments",
                  desc: "Pay confidently with Razorpay via UPI, cards, or net banking.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="glass-dark rounded-2xl p-6 hover:bg-white/10 transition-colors group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-gold-400 to-gold-500 rounded-2xl flex items-center justify-center text-purple-900 mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg shadow-gold-500/20">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-purple-200/80 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 pb-16 md:pb-20">
        <div className="relative bg-gradient-to-r from-gold-400 via-gold-500 to-amber-500 rounded-3xl p-8 md:p-12 overflow-hidden">
          <div className="absolute inset-0 animate-shimmer pointer-events-none" />
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -left-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-purple-900">
                Ready to Start Collecting?
              </h2>
              <p className="text-purple-800/80 mt-2 font-medium">
                Join thousands of happy collectors across India.
              </p>
            </div>
            <Link
              href="/shop"
              className="shrink-0 inline-flex items-center gap-2 bg-purple-900 text-white font-bold px-8 py-4 rounded-2xl hover:bg-purple-800 hover:scale-105 transition-all duration-300 shadow-xl shadow-purple-900/30"
            >
              Explore Shop
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
