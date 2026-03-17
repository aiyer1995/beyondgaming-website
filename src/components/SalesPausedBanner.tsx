"use client";

import { useState, useEffect } from "react";

export default function SalesPausedBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SALES_PAUSED !== "true") return;
    const dismissed = sessionStorage.getItem("sales-paused-dismissed");
    if (!dismissed) setShow(true);
  }, []);

  if (!show) return null;

  const handleClose = () => {
    setShow(false);
    sessionStorage.setItem("sales-paused-dismissed", "1");
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-[#1a0030] p-6 text-white text-center">
          <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold">Sales Temporarily Paused</h3>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-700 leading-relaxed">
            Sales on products is temporarily paused till month end. We will resume sales from <strong className="text-gray-900">2nd April</strong>.
          </p>
          <p className="text-purple-700 font-semibold mt-3">
            Grading services will remain operational.
          </p>
          <button
            onClick={handleClose}
            className="mt-6 px-8 py-3 bg-purple-700 text-white font-semibold rounded-xl hover:bg-purple-800 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
