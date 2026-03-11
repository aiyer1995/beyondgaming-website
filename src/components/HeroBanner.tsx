import Link from "next/link";
import Image from "next/image";

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1a0030] via-purple-900 to-purple-800 noise">
      {/* Hero background image — aligned right so characters are fully visible */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-banner.png"
          alt="Beyond Gaming - Trading Cards Collection"
          fill
          className="object-cover object-right"
          priority
          sizes="100vw"
        />
        {/* Gradient overlay only on the left for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0030] via-[#1a0030]/85 to-transparent" />
      </div>

      {/* Floating sparkles */}
      <div className="absolute top-20 left-[10%] w-2 h-2 bg-gold-400 rounded-full animate-float opacity-60" />
      <div className="absolute top-32 left-[25%] w-1.5 h-1.5 bg-purple-300 rounded-full animate-float-slow opacity-50" />
      <div className="absolute bottom-24 left-[15%] w-2.5 h-2.5 bg-gold-300 rounded-full animate-float-delay opacity-40" />

      <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16 lg:py-20">
        <div className="max-w-xl animate-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass-dark rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-purple-200 tracking-wide uppercase">
              Shipping Nationwide
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
            India&apos;s Leading{" "}
            <span className="text-gradient-gold inline-block">
              Collectibles
            </span>{" "}
            Shop
          </h1>

          <p className="mt-4 text-lg md:text-xl font-semibold text-white/80 tracking-wide">
            For Collectors. By Collectors.
          </p>

          <p className="mt-3 text-purple-300/80 text-sm md:text-base leading-relaxed max-w-lg">
            Trading Cards &bull; Licensed Accessories &bull; Official Merchandise &bull; Supplies
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-400 text-purple-900 font-bold px-8 py-4 rounded-2xl shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 hover:scale-105 transition-all duration-300"
            >
              <span>Shop Now</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <div className="absolute inset-0 rounded-2xl animate-shimmer pointer-events-none" />
            </Link>
            <Link
              href="/grading"
              className="inline-flex items-center gap-2 glass-dark text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/15 transition-all duration-300"
            >
              Grading Services
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-10 flex flex-wrap gap-8 md:gap-12">
            {[
              { value: "5000+", label: "Happy Customers" },
              { value: "100%", label: "Authentic Products" },
              { value: "Pan India", label: "Delivery" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-xl md:text-2xl font-black text-white">{stat.value}</div>
                <div className="text-[10px] text-purple-300/70 uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animated ticker */}
      <div className="relative bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 py-2.5 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex items-center gap-8 text-sm font-bold text-purple-900">
              <span className="flex items-center gap-2">&#9733; Pokemon TCG</span>
              <span className="flex items-center gap-2">&#9733; One Piece TCG</span>
              <span className="flex items-center gap-2">&#9733; Dragon Ball TCG</span>
              <span className="flex items-center gap-2">&#9733; Graded Slabs</span>
              <span className="flex items-center gap-2">&#9733; 100% Authentic Products</span>
              <span className="flex items-center gap-2">&#9733; Shipped in 1-3 Days</span>
              <span className="flex items-center gap-2">&#9733; Supplies &amp; Accessories</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
