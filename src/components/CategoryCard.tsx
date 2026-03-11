import Link from "next/link";
import Image from "next/image";

interface CategoryCardProps {
  name: string;
  slug: string;
  emoji: string;
  image?: string;
  productCount?: number;
  gradient?: string;
}

export default function CategoryCard({
  name,
  slug,
  emoji,
  image,
  productCount,
  gradient,
}: CategoryCardProps) {
  const bg = gradient || "from-purple-600 to-purple-800";

  return (
    <Link
      href={`/category/${slug}`}
      className="group relative block overflow-hidden rounded-3xl aspect-[3/4] hover:shadow-2xl hover:shadow-purple-300/30 transition-all duration-500 hover:-translate-y-2"
    >
      {/* Background - AI image or gradient fallback */}
      {image ? (
        <>
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover object-center group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </>
      ) : (
        <>
          <div className={`absolute inset-0 bg-gradient-to-br ${bg} transition-transform duration-700 group-hover:scale-110`} />
          <div className="absolute inset-0 opacity-[0.08]" style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)`
          }} />
        </>
      )}

      {/* Decorative circles */}
      <div className="absolute -top-6 -right-6 w-24 h-24 border border-white/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 border border-white/10 rounded-full group-hover:scale-125 transition-transform duration-700" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 text-white p-5 pb-6 text-center">
        {/* Name - visible by default, hidden on hover */}
        <h3 className="text-base md:text-lg font-bold tracking-wide leading-tight drop-shadow-lg group-hover:opacity-0 group-hover:-translate-y-2 transition-all duration-300">
          {name}
        </h3>
        {productCount !== undefined && productCount > 0 && (
          <p className="mt-1 text-xs opacity-70 font-medium group-hover:opacity-0 transition-all duration-300">
            {productCount} products
          </p>
        )}

        {/* Shop button - hidden by default, visible on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <span className="inline-flex items-center gap-1.5 text-sm font-bold bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full">
            Shop
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
