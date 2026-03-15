"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { CartAddOn } from "@/types/woocommerce";

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, removeItem, updateQuantity, getTotal } =
    useCartStore();

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  const total = getTotal();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl shadow-purple-900/20 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-purple-100/50">
          <div>
            <h2 className="text-lg font-black text-gray-900">Your Cart</h2>
            <p className="text-xs text-gray-400 mt-0.5">{items.length} {items.length === 1 ? "item" : "items"}</p>
          </div>
          <button
            onClick={closeDrawer}
            className="p-2 hover:bg-purple-50 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300">
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-400">Your cart is empty</p>
              <button onClick={closeDrawer} className="mt-4 text-sm text-purple-600 font-semibold hover:underline">
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.product.id}
                  className="flex gap-3 p-3 bg-purple-50/50 rounded-2xl border border-purple-100/50"
                >
                  <Link href={`/shop/${item.product.slug}`} onClick={closeDrawer} className="shrink-0">
                    <div className="relative w-20 h-20 bg-white rounded-xl overflow-hidden border border-purple-100/50">
                      {item.product.images[0] ? (
                        <Image
                          src={item.product.images[0].src}
                          alt={item.product.name}
                          fill
                          className="object-contain p-1.5"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-purple-200 text-xs">
                          No image
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
                      {item.product.name}
                    </h3>
                    <p className="text-sm font-bold text-gradient-purple mt-1">
                      {formatPrice(item.product.price)}
                    </p>

                    {item.addOns && item.addOns.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {item.addOns.map((addOn: CartAddOn) => (
                          <p key={addOn.name} className="text-[11px] text-purple-600">
                            + {addOn.name} ({formatPrice(addOn.price)})
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center bg-white border border-purple-100 rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.addOns)}
                          className="px-2.5 py-1 text-gray-400 hover:text-purple-700 hover:bg-purple-50 transition-colors text-sm font-bold"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-bold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.addOns)}
                          className="px-2.5 py-1 text-gray-400 hover:text-purple-700 hover:bg-purple-50 transition-colors text-sm font-bold"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.product.id, item.addOns)}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-purple-100/50 p-5 space-y-4 bg-purple-50/30">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Subtotal</span>
              <span className="text-xl font-black text-gray-900">
                {formatPrice(total)}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 text-center">Shipping calculated at checkout</p>
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="block w-full py-3.5 text-center bg-gradient-to-r from-purple-700 to-purple-600 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-purple-600/30 hover:scale-[1.02] transition-all"
            >
              Checkout &mdash; {formatPrice(total)}
            </Link>
            <Link
              href="/cart"
              onClick={closeDrawer}
              className="block w-full py-3 text-center text-purple-700 font-semibold text-sm hover:underline"
            >
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
