"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
        Order Confirmed!
      </h1>
      <p className="text-gray-500 text-lg mb-2">
        Thank you for your purchase.
      </p>
      {orderId && (
        <p className="text-purple-700 font-semibold mb-8">
          Order #{orderId}
        </p>
      )}

      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 mb-8 text-left">
        <h3 className="font-bold text-gray-900 mb-2">What happens next?</h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-0.5">1.</span>
            You&apos;ll receive an order confirmation email shortly.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-0.5">2.</span>
            We&apos;ll prepare and ship your order within 1-3 business days.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-0.5">3.</span>
            You&apos;ll get a tracking number once it&apos;s shipped.
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-700 to-purple-600 text-white font-bold px-8 py-3.5 rounded-xl hover:from-purple-800 hover:to-purple-700 transition-all shadow-lg shadow-purple-700/20"
        >
          View My Orders
        </Link>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-200 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
