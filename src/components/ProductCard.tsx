"use client";

import Image from "next/image";
import Link from "next/link";
import { WCProduct } from "@/types/woocommerce";
import { formatPrice, getStockLabel } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

interface ProductCardProps {
  product: WCProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const image = product.images[0];
  const stock = getStockLabel(product.stock_status, product.stock_quantity);
  const isOutOfStock = product.stock_status === "outofstock";

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-purple-100/60 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-200/30 transition-all duration-500 hover:-translate-y-2">
      {/* Subtle gradient accent on top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-purple-400 to-gold-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-purple-50/30 overflow-hidden">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt || product.name}
              fill
              className="object-contain p-5 group-hover:scale-110 transition-transform duration-700 ease-out"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-purple-200">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.on_sale && (
              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg shadow-red-500/20 uppercase tracking-wide">
                Sale
              </span>
            )}
          </div>

          {/* Quick add overlay */}
          {!isOutOfStock && (
            <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              <button
                onClick={(e) => { e.preventDefault(); addItem(product); }}
                className="w-full py-2.5 bg-purple-900/90 backdrop-blur-sm text-white text-xs font-bold rounded-xl hover:bg-purple-800 transition-colors shadow-lg flex items-center justify-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Quick Add
              </button>
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-gray-900/90 text-white text-xs font-bold px-5 py-2 rounded-xl uppercase tracking-wider">
                Sold Out
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/shop/${product.slug}`}>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[2.5rem] hover:text-purple-700 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-lg font-black text-gradient-purple">
            {formatPrice(product.price)}
          </span>
          {product.on_sale && product.regular_price && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.regular_price)}
            </span>
          )}
        </div>

        <div className="mt-1.5 flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${product.stock_status === "instock" ? "bg-green-400" : "bg-red-400"}`} />
          <span className={`text-xs font-medium ${stock.color}`}>
            {stock.text}
          </span>
        </div>
      </div>
    </div>
  );
}
