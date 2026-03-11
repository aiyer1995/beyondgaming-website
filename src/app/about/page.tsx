import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero with image */}
      <div className="relative rounded-3xl overflow-hidden mb-14">
        <div className="relative h-72 md:h-96">
          <Image
            src="/about-team.jpg"
            alt="Beyond Gaming Founders"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/40 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-400 mb-2">
            Our Story
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-white">About Beyond Gaming</h1>
          <p className="text-lg text-purple-200 font-medium mt-2">
            For Collectors. By Collectors.
          </p>
          <p className="text-sm text-white mt-3 max-w-2xl leading-relaxed">
            Beyond Gaming is India&apos;s leading one-stop collectibles shop, founded by passionate
            collectors who understand the thrill of the hunt. We started with a simple mission: to
            make authentic trading cards and collectibles accessible to fans across India.
          </p>
        </div>
      </div>

      {/* The Team */}
      <div className="mb-14">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-500 mb-2">
            The People Behind BG
          </p>
          <h2 className="text-3xl font-black text-gray-900">Meet The Team</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              name: "Aditya Iyer",
              aka: "ayersvault",
              role: "Partner & Co-Founder",
              image: "/team-aditya.jpg",
              instagram: "https://instagram.com/ayersvault",
              desc: "Aditya focuses on technology & grading operations. He is actively involved in shaping Beyond Gaming\u2019s long-term approach to building a collector driven collectibles ecosystem in India.",
            },
            {
              name: "Erik Nanda",
              aka: "goat_tcg",
              role: "Partner & Co-Founder",
              image: "/team-erik.jpg",
              imageScale: "scale-125",
              instagram: "https://instagram.com/goat_tcg",
              desc: "Erik leads operations and execution. He is responsible for building reliable fulfilment and operational frameworks that support growth across both online and offline channels.",
            },
            {
              name: "Karan Oberoi",
              aka: "obbytcg",
              role: "Partner",
              image: "/team-karan.jpg",
              imageScale: "",
              imagePosition: "top",
              instagram: "https://instagram.com/obbytcg",
              desc: "Karan leads customer engagements, major events, and community-led growth. He anchors Beyond Gaming\u2019s live \u201CRip & Ship\u201D experiences and plays a key role in grassroots engagement with collectors and players.",
            },
            {
              name: "Abhisek Bajaj",
              aka: "GodspeedxD",
              role: "Partner",
              imagePosition: "center 30%",
              imageScale: "scale-110",
              image: "/team-abhisek.jpg",
              instagram: "https://instagram.com/iamgodspeedxd",
              desc: "Abhisek leads procurement, global sourcing, and supplier partnerships. He is responsible for building reliable supply channels, managing vendor relationships, and ensuring consistent product availability.",
            },
          ].map((member) => (
            <div key={member.name} className="bg-white rounded-2xl border border-purple-100/50 p-6 flex gap-5">
              <div className="w-24 h-28 rounded-2xl bg-purple-100 shrink-0 overflow-hidden">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={96}
                  height={112}
                  className={`w-full h-full object-cover ${member.imageScale || ""}`}
                  style={{ objectPosition: member.imagePosition || "top" }}
                />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  {member.name} <span className="text-sm font-normal text-gray-400">/ {member.aka}</span>
                </h3>
                <p className="text-xs font-semibold text-purple-600 mb-2">{member.role}</p>
                <p className="text-sm text-gray-500 leading-relaxed mb-2">{member.desc}</p>
                <a
                  href={member.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  @{member.instagram.split("/").pop()}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What we offer */}
      <div className="mb-14">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-500 mb-2">
            Our Products
          </p>
          <h2 className="text-3xl font-black text-gray-900">What We Offer</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "Pokemon TCG", desc: "English & Japanese booster boxes, packs, ETBs, tins, and singles.", emoji: "\u26A1" },
            { title: "One Piece TCG", desc: "Booster boxes, special sets, and file sets from Bandai.", emoji: "\u2693" },
            { title: "Dragon Ball TCG", desc: "The latest Dragon Ball card game products from Bandai.", emoji: "\uD83D\uDD25" },
            { title: "Graded Slabs", desc: "PSA, BGS, and CGC graded cards for serious collectors.", emoji: "\uD83C\uDFC6" },
            { title: "Supplies", desc: "Sleeves, binders, toploaders, and everything to protect your collection.", emoji: "\uD83D\uDEE1\uFE0F" },
            { title: "Toys & Collectibles", desc: "Labubu, Pop Mart, and other licensed collectible figures.", emoji: "\u2728" },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl border border-purple-100/50 p-6 hover:shadow-lg hover:shadow-purple-100/30 hover:-translate-y-1 transition-all duration-300">
              <span className="text-2xl">{item.emoji}</span>
              <h3 className="font-bold text-gray-900 mt-3">{item.title}</h3>
              <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why us */}
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-[#1a0030] rounded-3xl p-8 md:p-12 relative overflow-hidden noise mb-14">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/10 rounded-full blur-[80px]" />
        <div className="relative">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white">
              Why Choose <span className="text-gradient-gold">Us</span>?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "\uD83D\uDEE1\uFE0F", title: "100% Authentic", desc: "Every product is genuine, officially licensed, and sourced from authorized distributors. No fakes, ever." },
              { icon: "\u26A1", title: "Lightning Fast Shipping", desc: "All orders are shipped within 1-3 business days with tracking. Pan-India delivery." },
              { icon: "\u2764\uFE0F", title: "Community First", desc: "We're collectors too. We understand the passion, the excitement, and the joy of collecting." },
            ].map((item) => (
              <div key={item.title} className="glass-dark rounded-2xl p-6">
                <span className="text-3xl">{item.icon}</span>
                <h3 className="font-bold text-white text-lg mt-3 mb-2">{item.title}</h3>
                <p className="text-sm text-purple-200/70 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/shop"
          className="group inline-flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-400 text-purple-900 font-bold px-8 py-4 rounded-2xl shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 hover:scale-105 transition-all duration-300"
        >
          Start Shopping
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
