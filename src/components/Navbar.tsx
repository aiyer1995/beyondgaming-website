"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";

const NAV_LINKS = [
  { href: "/category/pokemon-tcg-products", label: "Pokemon" },
  { href: "/category/one-piece-tcg", label: "One Piece" },
  { href: "/category/supplies", label: "Supplies" },
  { href: "/grading", label: "Grading" },
  { href: "/contact", label: "Contact Us" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { getItemCount, openDrawer } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const itemCount = mounted ? getItemCount() : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "shadow-lg shadow-purple-900/10" : ""}`}>
      {/* Top bar */}
      <div className="bg-gradient-to-r from-[#1a0030] via-purple-900 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="shrink-0 group">
            <Image
              src="https://beyondgaming.in/wp-content/uploads/2025/11/BG-New-2.png"
              alt="Beyond Gaming"
              width={160}
              height={44}
              className="h-11 w-auto group-hover:scale-105 transition-transform"
              priority
            />
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
            <div className="relative w-full group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full pl-5 pr-14 py-3 rounded-2xl bg-white/10 border border-white/10 text-white text-sm placeholder-purple-300/50 focus:outline-none focus:bg-white/15 focus:border-purple-400/30 focus:ring-2 focus:ring-purple-400/20 transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              href={user ? "/account" : "/login"}
              className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>

            <button
              onClick={openDrawer}
              className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-gold-500 to-gold-400 text-purple-900 text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-slide-up">
                  {itemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <nav className={`hidden md:block transition-all duration-300 ${scrolled ? "glass" : "bg-white/95 backdrop-blur-sm border-b border-purple-100/50"}`}>
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="relative block px-5 py-3 text-sm font-semibold text-gray-600 hover:text-purple-700 transition-colors group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full group-hover:w-4/5 transition-all duration-300" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-b border-purple-100/50 shadow-xl">
          <form onSubmit={handleSearch} className="p-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full px-4 py-3 rounded-xl border border-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/80"
            />
          </form>
          <ul className="pb-4 stagger-children">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-6 py-3.5 text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
