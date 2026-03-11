"use client";

import { useState } from "react";

export default function ShippingInfoPopup() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors"
      >
        Where do I ship?
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-[#1a0030] p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/10 rounded-full blur-[40px]" />
              <h3 className="text-lg font-bold relative">Shipping Address & Instructions</h3>
              <p className="text-purple-300 text-sm mt-1 relative">Ship your cards to this address</p>
            </div>
            <div className="p-6 space-y-5">
              {/* Address */}
              <div className="bg-purple-50 rounded-2xl p-5">
                <p className="font-bold text-gray-900 text-base">Beyond Grading</p>
                <p className="font-semibold text-gray-800 mt-1">Aditya Iyer</p>
                <div className="text-sm text-gray-600 mt-2 space-y-0.5">
                  <p>406 Gala Mart,</p>
                  <p>Next to Gala Aria,</p>
                  <p>South Bopal, Bopal,</p>
                  <p className="font-semibold text-gray-800">Ahmedabad - 380058</p>
                </div>
                <p className="text-sm text-gray-800 font-semibold mt-3">
                  Phone: +91 9909611611
                </p>
              </div>

              {/* Important Points */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3">Important Points to Note</h4>
                <ul className="space-y-2.5 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5 shrink-0">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span>Share tracking number to <strong>+91 9909611611</strong> by WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5 shrink-0">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span>Use a private courier: <strong>Delhivery / DTDC / Blue Dart / Tirupati / Professional Couriers</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5 shrink-0">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span>Ensure your card is sleeved and packed in a toploader / semi-rigid in a box with plenty of protection.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5 shrink-0">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span>Beyond Grading / Beyond Gaming is <strong>not liable for any damage in transit</strong>, so ensure your cards are well packed.</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="w-full py-3 rounded-xl text-sm font-bold text-purple-900 bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-400 transition-all shadow-lg shadow-gold-500/20"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
