"use client";

import { useState } from "react";
import { WCProduct, CartAddOn } from "@/types/woocommerce";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

const GRADING_ADD_ONS: CartAddOn[] = [
  { name: "Slab Cracking", price: 499 },
  { name: "Card Cleaning & Light Repair", price: 999 },
];

const NO_CLEANING_SLUGS = [
  "bgs-grading-express",
  "bgs-grading-standard",
  "psa-grading-value",
  "psa-grading-value-plus",
  "psa-grading-value-max",
];

interface AddToCartButtonProps {
  product: WCProduct;
  isGrading?: boolean;
}

export default function AddToCartButton({ product, isGrading }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<Set<number>>(new Set());
  const { addItem } = useCartStore();
  const isOutOfStock = product.stock_status === "outofstock";
  const maxQty = product.stock_quantity ?? 99;

  const availableAddOns = isGrading
    ? GRADING_ADD_ONS.filter(
        (a) => !(a.name === "Card Cleaning & Light Repair" && NO_CLEANING_SLUGS.includes(product.slug))
      )
    : [];

  const toggleAddOn = (index: number) => {
    setSelectedAddOns((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const getSelectedAddOns = (): CartAddOn[] => {
    return availableAddOns.filter((_, i) => selectedAddOns.has(i));
  };

  const addOnsTotal = getSelectedAddOns().reduce((sum, a) => sum + a.price, 0);

  const handleAdd = () => {
    const addOns = isGrading ? getSelectedAddOns() : undefined;
    addItem(product, quantity, addOns);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    setQuantity(1);
    setSelectedAddOns(new Set());
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
    <div className="space-y-4">
      {/* Grading Add-ons */}
      {isGrading && availableAddOns.length > 0 && (
        <div className="bg-purple-50/70 rounded-2xl border border-purple-100 p-5 space-y-3">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Additional Services
          </h3>
          {availableAddOns.map((addOn, index) => (
            <label
              key={addOn.name}
              className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                selectedAddOns.has(index)
                  ? "border-purple-500 bg-purple-50"
                  : "border-transparent bg-white hover:border-purple-200"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedAddOns.has(index)}
                onChange={() => toggleAddOn(index)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-400"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">{addOn.name}</span>
                  <span className="text-sm font-bold text-purple-700">+{formatPrice(addOn.price)}</span>
                </div>
                {addOn.name === "Card Cleaning & Light Repair" && (
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Only to be chosen to reduce light holo scratches and reduce creasing and bends.
                    Whitening and major damage cannot be repaired or restored through this service.{" "}
                    <span className="text-red-600 font-bold">Consult our team before choosing this option.</span>
                  </p>
                )}
              </div>
            </label>
          ))}
        </div>
      )}

      {/* Quantity + Add to Cart */}
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
              {isGrading && addOnsTotal > 0 && (
                <span className="text-purple-200 text-sm font-medium ml-1">
                  (+{formatPrice(addOnsTotal)})
                </span>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
