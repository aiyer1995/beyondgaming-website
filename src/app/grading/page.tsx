import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/lib/woocommerce";
import { formatPrice } from "@/lib/utils";
import ProductGrid from "@/components/ProductGrid";
import GradingFAQ from "./GradingFAQ";
import ShippingInfoPopup from "./ShippingInfoPopup";
import GradingFormPopup from "./GradingFormPopup";

export const revalidate = 60;

const LOT_STYLES = [
  { label: "Currently Active Lot", key: "active_lot", color: "bg-green-50 border-green-200 text-green-800", dot: "bg-green-500 animate-pulse" },
  { label: "Next Scheduled Lot", key: "next_lot", color: "bg-yellow-50 border-yellow-200 text-yellow-800", dot: "bg-yellow-500" },
  { label: "In Progress Lots", key: "in_progress_lots", color: "bg-gray-50 border-gray-200 text-gray-800", dot: "bg-gray-400" },
];

const FALLBACK_LOTS = { active_lot: "None", next_lot: "March 15th - 25th 2026", in_progress_lots: "Nov 2025 / Jan 2026" };

async function getGradingLots(): Promise<Record<string, string>> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/wp-json/bg/v1/grading-lots?_=${Date.now()}`,
      { cache: "no-store" }
    );
    if (!res.ok) return FALLBACK_LOTS;
    return await res.json();
  } catch {
    return FALLBACK_LOTS;
  }
}

const PROCESS_STEPS = [
  {
    title: "Add Your Grading Sub to Cart",
    desc: "Choose a grading tier below and add it to your cart. Select quantity based on number of cards.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    title: "Checkout",
    desc: "Complete your order and payment for the grading service.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    title: "Fill the Grading Form",
    desc: "Submit card details and your order number.",
    showForm: true,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: "Ship Your Items",
    desc: "Ship your cards to us securely.",
    showShipping: true,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
      </svg>
    ),
  },
];

const FEATURES = [
  { title: "Informed Selection", desc: "Choose the grading tier that is best suited for your needs." },
  { title: "Add-On Services", desc: "Choose Add-On Services such as Assessment, Clean-Up and Repair." },
  { title: "Real Time Tracking", desc: "Know where your Submission is in the grading cycle." },
  { title: "No Hidden Costs", desc: "Know all possible costs upfront when booking your Submission." },
];

export default async function GradingPage() {
  const [allGrading, lotData] = await Promise.all([
    getProducts({ category: 302, per_page: 100 }),
    getGradingLots(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-500 mb-2">
          Beyond Grading
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900">
          Grading & <span className="text-gradient-gold">Authentication</span> Services
        </h1>
      </div>

      {/* Hero: Image + Steps (hidden on mobile) */}
      <div className="hidden lg:grid lg:grid-cols-[350px_1fr] gap-8 mb-12 items-center">
        <div className="relative">
          <Image
            src="/grading-promo.png"
            alt="Beyond Grading - The Best Grading & Authentication Partner in India"
            width={768}
            height={768}
            className="w-full h-auto rounded-3xl"
            priority
          />
        </div>
        <div>
          <div className="grid grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-gradient-to-br from-purple-50 to-white rounded-2xl border-2 border-gold-400 p-5">
                <span className="text-3xl font-black text-gold-300">{i + 1}.</span>
                <h3 className="text-sm font-bold text-gray-900 mt-1 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <hr className="hidden lg:block border-2 border-gold-400 mb-12" />

      {/* Lot Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {LOT_STYLES.map((lot) => (
          <div
            key={lot.label}
            className={`rounded-2xl border p-5 ${lot.color}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${lot.dot}`} />
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-70">
                {lot.label}
              </h3>
            </div>
            <p className="text-base font-bold">{lotData[lot.key] || "—"}</p>
          </div>
        ))}
      </div>

      {/* Process Map */}
      <div className="mb-14">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-500 mb-2">
          How It Works
        </p>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">
          Submission Process
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROCESS_STEPS.map((step, i) => (
            <div key={i} className="relative">
              {/* Arrow connector */}
              {i < PROCESS_STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-2.5 translate-x-1/2 -translate-y-1/2 z-10">
                  <svg className="w-3 h-3 text-gold-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 3l3.057-3L20 12 8.057 24 5 21l8.5-9L5 3z" />
                  </svg>
                </div>
              )}
              <div className="bg-white rounded-2xl border border-purple-100/50 p-5 h-full hover:shadow-lg hover:shadow-purple-100/30 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-500 rounded-xl flex items-center justify-center text-purple-900 shrink-0 shadow-sm shadow-gold-500/20">
                    {step.icon}
                  </div>
                  <span className="text-xs font-bold text-gold-500">Step {i + 1}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-xs text-gray-500 mb-3">{step.desc}</p>
                {step.showForm && <GradingFormPopup />}
                {step.showShipping && <ShippingInfoPopup />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grading Tiers */}
      <div className="mb-14">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-500 mb-2">
            Choose Your Tier
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
            Grading Tiers
          </h2>
          <p className="text-sm text-gray-500">
            Kindly place a separate order for grading submissions.{" "}
            <span className="text-red-600 font-bold">DO NOT</span>{" "}
            <span className="font-medium text-gray-700">club with product purchases.</span>
          </p>
        </div>

        <ProductGrid products={allGrading} columns={5} />
      </div>

      {/* FAQ */}
      <div className="max-w-4xl mx-auto mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-500 mb-2 text-center">
          Got Questions?
        </p>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 text-center mb-8">
          Frequently Asked Questions
        </h2>
        <GradingFAQ />
      </div>
    </div>
  );
}
