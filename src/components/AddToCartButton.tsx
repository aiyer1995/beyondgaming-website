"use client";

import { useState } from "react";
import { WCProduct } from "@/types/woocommerce";
import { useCartStore } from "@/store/cart";

interface AddToCartButtonProps {
  product: WCProduct;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCartStore();
  const isOutOfStock = product.stock_status === "outofstock";
  const maxQty = product.stock_quantity ?? 99;

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    setQuantity(1);
  };

  if (isOutOfStock) {
    return (
      <button
        disabled
        className="w-full py-4 rounded-2xl bg-gray-100 text-gray-400 font-bold text-lg cursor-not-allowed border-2 border-gray-200"
      >
        Out of Stock
      </button>
    );
  }

  return (
    <div className="flex gap-3">
      {/* Quantity selector */}
      <div className="flex items-center bg-purple-50 border-2 border-purple-100 rounded-2xl overflow-hidden">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="px-4 py-3.5 text-purple-400 hover:text-purple-700 hover:bg-purple-100 transition-all font-bold text-lg"
        >
          -
        </button>
        <span className="px-5 py-3.5 font-black text-gray-900 min-w-[3.5rem] text-center text-lg">
          {quantity}
        </span>
        <button
          onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
          disabled={quantity >= maxQty}
          className={`px-4 py-3.5 transition-all font-bold text-lg ${quantity >= maxQty ? "text-gray-300 cursor-not-allowed" : "text-purple-400 hover:text-purple-700 hover:bg-purple-100"}`}
        >
          +
        </button>
      </div>

      {/* Add to cart */}
      <button
        onClick={handleAdd}
        className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg ${
          added
            ? "bg-green-500 text-white shadow-green-500/30 scale-[0.98]"
            : "bg-gradient-to-r from-purple-700 to-purple-600 text-white hover:shadow-purple-600/40 hover:scale-[1.02] active:scale-[0.98]"
        }`}
      >
        {added ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Added!
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Add to Cart
          </>
        )}
      </button>
    </div>
  );
}
