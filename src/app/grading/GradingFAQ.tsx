"use client";

import { useState } from "react";

const FAQS = [
  {
    question: "What kind of cards can I currently grade with Beyond Grading?",
    answer: (
      <ul className="list-disc pl-5 space-y-2 text-gray-600">
        <li>
          Beyond Grading currently accepts cards within the Trading Card Game (TCG) category that are
          specifically manufactured by the Pokemon Company, Bandai TCG, or Konami.
        </li>
        <li>
          This includes cards from popular franchises such as Pokemon, Dragon Ball, One Piece,
          Digimon, Yu-Gi-Oh!, and more.
        </li>
        <li>
          If your card is not produced by TPC, Bandai, or Konami, we recommend contacting us first to
          confirm if it can be graded.
        </li>
      </ul>
    ),
  },
  {
    question: "I have placed my order! What next, How do I submit my cards?",
    answer: (
      <div className="space-y-4 text-gray-600">
        <p>
          Once you&apos;ve placed your order with us, you will receive an order number, which can be viewed
          under <strong>My Accounts &gt; Orders</strong>.
        </p>
        <p>
          Next, please fill out the{" "}
          <span className="text-purple-700 font-bold">GRADING FORM</span>, which requires your basic
          information, order number, and details about the cards you wish to submit for grading.
        </p>
        <p>Find Shipping Instructions on the same page as the form!</p>
        <div>
          <p className="font-semibold text-gray-900 mb-2">Mailing Instructions and Care Guide:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <em>Sleeve</em> each card in a penny sleeve.
            </li>
            <li>
              Place your card inside a <strong>Toploader</strong> or{" "}
              <strong>Card Saver (Semi-Rigid)</strong>, then seal it inside a resealable bag.
            </li>
            <li>
              <em>Sandwich</em> the cards between two pieces of cardboard to protect them during
              transit.
            </li>
            <li>
              Use a <strong>cardboard box</strong> with sufficient <strong>bubble wrap</strong> or a{" "}
              <strong>bubble mailer</strong> to securely ship your submission.
            </li>
          </ul>
        </div>
        <p className="text-sm">
          <strong>Important:</strong>{" "}
          <em>
            Beyond Grading is not responsible for any damage that occurs during transit. We record an
            unboxing video of every package we receive for security purposes. If your card arrives
            damaged, it will be returned to you, and the order amount will be refunded minus a
            convenience and return shipping fee.
          </em>
        </p>
      </div>
    ),
  },
  {
    question: "What are the end to end charges for the Grading Submission?",
    answer: (
      <div className="space-y-4 text-gray-600">
        <div>
          <p className="font-semibold text-gray-900 mb-2">
            The base charge you pay at checkout covers all costs associated with:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Shipping the card to PSA for grading.</li>
            <li>Shipping the card back to India after grading.</li>
            <li>Customs duties and other charges.</li>
            <li>Return shipping to you.</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-gray-900 mb-2">What&apos;s Not Covered?</p>
          <p>
            <strong>Upcharges:</strong> Our base charge does not cover upcharges, which occur when a
            card is submitted under a lower grading tier than it qualifies for.
          </p>
          <p className="mt-2">
            For example: If you submit your card under the Standard Bulk Category (for cards valued
            under $300), but PSA determines the card&apos;s value exceeds $300 after grading, it should
            have been submitted under the Value Category. In this case, you will be responsible for
            paying the difference between the two tiers, along with any applicable taxes.
          </p>
          <p className="mt-2">
            You will receive a summary of the upcharge, and the additional amount will need to be paid
            before PSA releases the card to us.
          </p>
        </div>
        <div>
          <p className="font-semibold text-gray-900 mb-2">How is the Upcharge Calculated?</p>
          <p>The upcharge amount will be calculated as follows:</p>
          <p className="font-medium mt-1">
            (Upcharge amount - Paid tier amount) + Bank charges + Taxes
          </p>
        </div>
      </div>
    ),
  },
  {
    question: "What are the turnaround times and how can I calculate them for my Grading Submission?",
    answer: (
      <div className="space-y-4 text-gray-600">
        <p>
          Our turnaround times range from <strong>3 months</strong> to <strong>6 months</strong>,
          depending on the grading tier chosen.
        </p>
        <p>
          The turnaround time begins once we ship your submission to PSA, which typically occurs at the
          end of the month.
        </p>
        <div>
          <p className="font-semibold text-gray-900 mb-2">PSA Processing Time</p>
          <p className="text-sm italic mb-2">
            Please note: The estimated processing times below start once PSA physically receives and
            starts processing your submission. Working days do not include weekends or holidays.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Standard Bulk:</strong> 95+ working days (approximately 5 months)
            </li>
            <li>
              <strong>Value / Value (Dual):</strong> 75+ working days (approximately 4 months)
            </li>
            <li>
              <strong>Value Plus:</strong> 40+ working days (approximately 2 - 2.5 months)
            </li>
            <li>
              <strong>Value Max:</strong> 30 business days (approximately 1.5 - 2 months)
            </li>
            <li>
              <strong>Re-Holder:</strong> 80 business days (approximately 4 - 5 months)
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-gray-900 mb-2">Beckett (BGS) Processing Time</p>
          <p className="text-sm italic mb-2">
            Please note: The estimated processing times below start once BGS physically receives and
            starts processing your submission. Working days do not include weekends or holidays.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Base (With Sub-Grades):</strong> 50+ working days (approximately 3 months)
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-gray-900 mb-2">Beyond Grading Processing Time</p>
          <p>
            Beyond Grading adds an additional <strong>1 to 1.5 months</strong> for submission
            preparation and postage to and from PSA.
          </p>
        </div>
      </div>
    ),
  },
  {
    question: "What are the Typical Grading Stages and what do they mean",
    answer: (
      <ul className="list-disc pl-5 space-y-2 text-gray-600">
        <li>
          <strong>Shipping:</strong> Cards are packed and prepared for shipment to PSA.
        </li>
        <li>
          <strong>Order Prep:</strong> The submission is reviewed, verified, and logged into PSA&apos;s
          system.
        </li>
        <li>
          <strong>Research & ID:</strong> Cards are researched to ensure accurate details are noted on
          the label.
        </li>
        <li>
          <strong>Grading:</strong> The card undergoes authentication and grading.
        </li>
        <li>
          <strong>Assembly:</strong> Labels are printed, and the card is sealed in its PSA holder/slab.
        </li>
        <li>
          <strong>QA Check:</strong> Grades are re-checked for accuracy, labels are verified, and the
          holder is inspected for defects.
        </li>
        <li>
          <strong>Results Out:</strong> The grading results have been released, and the cards are on
          their way back to India.
        </li>
        <li>
          <strong>Ready to Ship:</strong> Cards have arrived in India and are now ready to ship back to
          you!
        </li>
      </ul>
    ),
  },
];

export default function GradingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
      {FAQS.map((faq, i) => (
        <div key={i}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between py-5 text-left gap-4 group"
          >
            <span className="text-sm md:text-base font-semibold text-gold-500 group-hover:text-gold-500/80 transition-colors">
              {faq.question}
            </span>
            <svg
              className={`w-5 h-5 text-gold-500 shrink-0 transition-transform duration-200 ${
                openIndex === i ? "rotate-45" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
            </svg>
          </button>
          {openIndex === i && (
            <div className="pb-5 text-sm leading-relaxed animate-fade-in">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
