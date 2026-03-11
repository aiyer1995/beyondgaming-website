export default function TermsConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-500 mb-2">
          Legal
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900">
          Terms & Conditions
        </h1>
        <p className="text-sm text-gray-400 mt-2">Last Updated: 01 / 01 / 2026</p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8">
        <Section title="1) Business Details">
          <p><strong>Legal Entity:</strong> Beyond Ventures LLP</p>
          <p>
            <strong>Address:</strong> 2004 Skywalk Tower, 20th Floor, Tank Lane, Orlem,
            Near Surana Hospital, Malad West, Mumbai &ndash; 400067
          </p>
          <p><strong>Email:</strong> contact@beyondgaming.in</p>
          <p><strong>Phone/WhatsApp:</strong> +91 9372443237</p>
        </Section>

        <Section title="2) Policies">
          <p>Usage governed by:</p>
          <ul>
            <li>Privacy Policy</li>
            <li>Shipping Policy</li>
            <li>Return &amp; Refund Policy</li>
          </ul>
          <p>
            If there is any conflict between these Terms and a Policy, the relevant Policy
            will prevail for that subject.
          </p>
        </Section>

        <Section title="3) Eligibility & User Responsibilities">
          <ul>
            <li>Users must be 18+ or supervised by a parent/legal guardian</li>
            <li>Must provide accurate information for orders</li>
            <li>
              Prohibited: malware introduction, unauthorized access, scraping, service
              disruption
            </li>
          </ul>
        </Section>

        <Section title="4) Product Nature (TCG & Collectibles)">
          <p>
            We sell trading cards, sealed packs/boxes, singles, graded cards, accessories,
            and supplies.
          </p>
          <p>
            Packs/boxes contain randomized contents. We do not guarantee pull rates, chase
            cards, rarity outcomes, specific contents, grading outcomes, or monetary value.
          </p>
        </Section>

        <Section title="5) Product Listings, Images & Condition Notes">
          <ul>
            <li>Images are representative; packaging/artwork varies by manufacturer</li>
            <li>Raw singles condition assessments are subjective</li>
            <li>Graded slabs follow grading company standards</li>
          </ul>
        </Section>

        <Section title="6) Pricing, Taxes & Availability">
          <ul>
            <li>Prices displayed in INR</li>
            <li>GST applies as shown at checkout</li>
            <li>Stock availability not guaranteed until order processed</li>
            <li>Pricing errors may result in order cancellation and refund</li>
          </ul>
        </Section>

        <Section title="7) Orders, Acceptance & Cancellations">
          <ul>
            <li>
              Order placement is an offer to purchase; acceptance occurs at
              processing/dispatch
            </li>
            <li>
              Company may refuse orders due to stock, pricing errors, address issues,
              payment verification, fraud suspicion
            </li>
            <li>Cancellation terms governed by Return &amp; Refund Policy</li>
          </ul>
        </Section>

        <Section title="8) Pre-Orders">
          <ul>
            <li>Release dates and delivery timelines are estimates</li>
            <li>May change due to supplier/manufacturer logistics</li>
            <li>
              Limited allocation; unfulfillable orders handled per Return &amp; Refund
              Policy
            </li>
            <li>
              Cancellation terms per Return &amp; Refund Policy and product disclosures
            </li>
          </ul>
        </Section>

        <Section title="9) Payments">
          <ul>
            <li>Processed via secure third-party gateways</li>
            <li>
              Company not responsible for bank failures, gateway downtime, or technical
              issues beyond control
            </li>
            <li>
              May request additional verification for high-value/suspicious transactions
            </li>
          </ul>
        </Section>

        <Section title="10) Shipping & Delivery">
          <p>
            All shipping methods, timelines, delivery exceptions, address responsibilities,
            failed delivery handling, and damage/tampering claims governed by Shipping
            Policy and Return &amp; Refund Policy.
          </p>
        </Section>

        <Section title="11) Returns, Replacements & Refunds">
          <p>
            All return/refund eligibility, exclusions (opened/tampered sealed products,
            randomized items, singles, slabs, mystery items), conditions, proof
            requirements, and processing timelines governed by Return &amp; Refund Policy.
          </p>
        </Section>

        <Section title="12) Mystery Boxes / Bundles">
          <p>
            Mystery products are curated/randomized by nature. Any rules for value
            guarantees, exclusions, and refundability governed by Return &amp; Refund
            Policy and product disclosures.
          </p>
        </Section>

        <Section title="13) Rip & Ship / Live Breaks">
          <p>
            Specific rules for finality after opening, shipping confirmation, claim
            windows, and proof requirements detailed on product pages and governed by
            applicable policies.
          </p>
        </Section>

        <Section title="14) Promotions & Discounts">
          <ul>
            <li>Promotions have separate terms, may be modified/withdrawn</li>
            <li>Discount codes non-redeemable for cash</li>
            <li>Gift cards/store credit subject to specific terms at issuance</li>
          </ul>
        </Section>

        <Section title="15) Intellectual Property">
          <p>
            All Website content, branding, logos, designs, and materials owned or licensed
            by us are protected. You may not copy, reuse, reproduce, distribute, or exploit
            without written permission.
          </p>
          <p>
            Third-party trademarks used for identification/resale purposes only.
          </p>
        </Section>

        <Section title="16) Prohibited Use">
          <p>Users must not:</p>
          <ul>
            <li>Attempt unauthorized system/server/database access</li>
            <li>Introduce malware, run bots/scrapers, disrupt Website</li>
            <li>Impersonate others, submit false information, engage in fraud</li>
            <li>Violate applicable law or third-party rights</li>
          </ul>
        </Section>

        <Section title="17) Disclaimer">
          <p>
            The Website is provided on an &ldquo;as is&rdquo; basis. We do not guarantee
            uninterrupted availability or error-free listings.
          </p>
          <p>
            Manufacturer variations not always grounds for return unless Policy-covered.
          </p>
        </Section>

        <Section title="18) Limitation of Liability">
          <p>
            We are not liable for indirect or consequential damages. Our total liability
            for any claim related to an order is limited to the amount paid for that
            specific order.
          </p>
        </Section>

        <Section title="19) Indemnity">
          <p>
            Users indemnify Beyond Ventures LLP from claims, damages, and expenses arising
            from Terms breach, Website misuse, or law/rights violations.
          </p>
        </Section>

        <Section title="20) Force Majeure">
          <p>
            Company not responsible for delays/failures from uncontrollable events: courier
            disruptions, natural events, strikes, governmental actions, outages.
          </p>
        </Section>

        <Section title="21) Changes to these Terms">
          <p>
            Terms may be updated anytime with revised &ldquo;Last Updated&rdquo; date.
            Continued use indicates acceptance.
          </p>
        </Section>

        <Section title="22) Governing Law & Jurisdiction">
          <p>
            Governed by Indian law. Mumbai, Maharashtra courts have jurisdiction subject to
            applicable consumer protection laws.
          </p>
        </Section>

        <Section title="23) Grievances & Complaints">
          <p><strong>Grievance Officer:</strong> Erik Nanda</p>
          <p><strong>Email:</strong> contact@beyondgaming.in</p>
          <p><strong>Phone:</strong> +91 93724 43237</p>
          <p>
            <strong>Address:</strong> 2004 Skywalk Tower, 20th Floor, Tank Lane, Orlem,
            Near Surana Hospital, Malad West, Mumbai &ndash; 400067
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-purple-100/50 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
      <div className="text-sm text-gray-600 space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        {children}
      </div>
    </div>
  );
}
