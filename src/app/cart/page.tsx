"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const MAGIC_ENV_ENABLED =
  process.env.NEXT_PUBLIC_MAGIC_CHECKOUT_ENABLED === "true";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const total = getTotal();
  const [magicReady, setMagicReady] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicError, setMagicError] = useState("");
  const [magicQueryEnabled, setMagicQueryEnabled] = useState(false);

  // Magic Checkout button is visible if either:
  //   - the env var NEXT_PUBLIC_MAGIC_CHECKOUT_ENABLED=true is set (full launch), or
  //   - the URL has ?magic=1 (private testing on prod without exposing the
  //     button to all users)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("magic") === "1") setMagicQueryEnabled(true);
  }, []);

  const showMagic = MAGIC_ENV_ENABLED || magicQueryEnabled;

  const handleMagicCheckout = async () => {
    setMagicError("");

    if (!magicReady) {
      setMagicError("Express checkout is still loading. Please try again in a few seconds.");
      return;
    }

    setMagicLoading(true);
    try {
      const res = await fetch("/api/razorpay/magic/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
            add_ons: item.addOns,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not start express checkout");
      }

      const options: Record<string, unknown> = {
        key: data.key_id,
        order_id: data.order_id,
        amount: data.amount,
        currency: data.currency,
        name: "Beyond Gaming",
        description: "Express Checkout",
        one_click_checkout: true,
        show_coupons: true,
        redirect: true,
        callback_url: `${window.location.origin}/api/razorpay/magic/callback`,
        theme: { color: "#7c3aed" },
        modal: {
          ondismiss: () => setMagicLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setMagicError(err instanceof Error ? err.message : "Express checkout failed");
      setMagicLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Looks like you haven&apos;t added anything yet.</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-purple-700 text-white font-medium px-8 py-3 rounded-xl hover:bg-purple-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {showMagic && (
        <Script
          src="https://checkout.razorpay.com/v1/magic-checkout.js"
          strategy="afterInteractive"
          onLoad={() => setMagicReady(true)}
          onError={() => setMagicError("Failed to load express checkout.")}
        />
      )}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, idx) => (
            <div
              key={`${item.product.id}-${idx}`}
              className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
            >
              <Link href={`/shop/${item.product.slug}`} className="shrink-0">
                <div className="relative w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-lg overflow-hidden">
                  {item.product.images[0] ? (
                    <Image
                      src={item.product.images[0].src}
                      alt={item.product.name}
                      fill
                      className="object-contain p-2"
                      sizes="128px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                      No image
                    </div>
                  )}
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/shop/${item.product.slug}`}>
                  <h3 className="font-medium text-gray-900 hover:text-purple-700 transition-colors line-clamp-2">
                    {item.product.name}
                  </h3>
                </Link>
                <p className="text-lg font-bold text-purple-700 mt-1">
                  {formatPrice(item.product.price)}
                </p>
                {item.addOns && item.addOns.length > 0 && (
                  <div className="mt-1">
                    {item.addOns.map((addOn) => (
                      <p key={addOn.name} className="text-xs text-purple-600">
                        + {addOn.name} ({formatPrice(addOn.price)})
                      </p>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.addOns)}
                      className="px-3 py-1.5 text-gray-500 hover:text-gray-700"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.addOns)}
                      className="px-3 py-1.5 text-gray-500 hover:text-gray-700"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-900">
                      {formatPrice(
                        (parseFloat(item.product.price) + (item.addOns || []).reduce((s, a) => s + a.price, 0)) * item.quantity
                      )}
                    </span>
                    <button
                      onClick={() => removeItem(item.product.id, item.addOns)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-2xl p-6 sticky top-28">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal ({items.length} items)</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="text-green-600 font-medium">Calculated at checkout</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-purple-900">{formatPrice(total)}</span>
              </div>
            </div>
            {showMagic && (
              <>
                <button
                  type="button"
                  onClick={handleMagicCheckout}
                  disabled={magicLoading || !magicReady}
                  className="block w-full py-3.5 text-center bg-gradient-to-r from-amber-400 to-amber-500 text-purple-900 font-bold rounded-xl hover:from-amber-300 hover:to-amber-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mb-3"
                >
                  {magicLoading
                    ? "Opening..."
                    : !magicReady
                      ? "Loading Express Checkout..."
                      : "Express Checkout"}
                </button>
                {magicError && (
                  <p className="text-xs text-red-500 mb-3 text-center">{magicError}</p>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              </>
            )}
            <Link
              href="/checkout"
              className="block w-full py-3.5 text-center bg-purple-700 text-white font-semibold rounded-xl hover:bg-purple-800 transition-colors"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/shop"
              className="block w-full py-3 mt-3 text-center text-purple-700 font-medium hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
