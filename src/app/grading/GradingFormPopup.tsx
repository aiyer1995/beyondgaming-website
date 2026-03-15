"use client";

import { useState } from "react";

const GRADING_CATEGORIES = [
  "BGS - BASE",
  "BGS - STANDARD",
  "BGS - EXPRESS",
  "PSA - VALUE BULK",
  "PSA - VALUE",
  "PSA - VALUE PLUS",
  "PSA - VALUE MAX",
  "PSA - DUAL AUTO",
  "PSA - REHOLDER",
  "CGC - ECONOMY",
];

interface CardRow {
  cardName: string;
  category: string;
}

export default function GradingFormPopup({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    orderNumber: "",
  });
  const [cards, setCards] = useState<CardRow[]>([{ cardName: "", category: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCardChange = (index: number, field: keyof CardRow, value: string) => {
    setCards(cards.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  };

  const addCard = () => setCards([...cards, { cardName: "", category: "" }]);

  const removeCard = (index: number) => {
    if (cards.length > 1) setCards(cards.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setForm({ firstName: "", lastName: "", email: "", phone: "", orderNumber: "" });
    setCards([{ cardName: "", category: "" }]);
    setError("");
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/grading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, cards }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={className || "inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors"}
      >
        Grading Form
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { setOpen(false); resetForm(); }}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-[#1a0030] p-5 text-white flex items-center justify-between shrink-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/10 rounded-full blur-[40px]" />
              <div className="relative">
                <h3 className="text-lg font-bold">Grading Form</h3>
                <p className="text-purple-300 text-sm mt-0.5">
                  Kindly fill this form after you place your Grading Order.
                </p>
              </div>
              <button
                onClick={() => { setOpen(false); resetForm(); }}
                className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {success ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Submission Received!</h4>
                  <p className="text-sm text-gray-500 mb-2">
                    Your grading form has been submitted successfully.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Please send clear front and back images of your cards to{" "}
                    <strong className="text-gray-700">+91 9909611611</strong> via WhatsApp.
                  </p>
                  <button
                    onClick={() => { setOpen(false); resetForm(); }}
                    className="px-6 py-2.5 bg-purple-700 text-white font-semibold rounded-xl hover:bg-purple-800 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Contact Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
                    <input
                      type="text"
                      name="orderNumber"
                      value={form.orderNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    />
                  </div>

                  {/* Card Details */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Card Details</h4>
                      <span className="text-xs text-gray-400">{cards.length} card(s)</span>
                    </div>

                    <div className="space-y-3">
                      {cards.map((card, i) => (
                        <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Card Name"
                              value={card.cardName}
                              onChange={(e) => handleCardChange(i, "cardName", e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                            />
                          </div>
                          <div className="flex-1">
                            <select
                              value={card.category}
                              onChange={(e) => handleCardChange(i, "category", e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white"
                            >
                              <option value="">Select Category</option>
                              {GRADING_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>
                          {cards.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeCard(i)}
                              className="px-3 py-2 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addCard}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-purple-700 hover:text-purple-900 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add More
                    </button>
                  </div>

                  {/* WhatsApp Notice */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm text-amber-800">
                      <strong>Important:</strong> Kindly submit clear front and back images of your cards to{" "}
                      <strong>+91 9909611611</strong> via WhatsApp. This will help us ensure the cards arrive
                      in the same condition and specification as shared with us.
                    </p>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-purple-700 text-white font-semibold rounded-xl hover:bg-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-700/20"
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
