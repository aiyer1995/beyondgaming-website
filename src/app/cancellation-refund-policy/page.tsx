export default function CancellationRefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-500 mb-2">
          Legal
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900">
          Cancellation & Refund Policy
        </h1>
      </div>

      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 mb-8">
        <p className="text-sm text-purple-800">
          Beyond Gaming believes in helping its customers as far as possible, and has
          therefore a liberal cancellation policy.
        </p>
      </div>

      <div className="space-y-8">
        <Section title="1. Cancellation Timing">
          <p>
            Orders can only be cancelled immediately after placement. However, cancellation
            requests cannot be honored once vendors have begun shipping the items.
          </p>
        </Section>

        <Section title="2. Perishable Items">
          <p>
            We do not accept cancellations for perishable goods like flowers or food, but
            will offer refunds or replacements if quality issues are documented.
          </p>
        </Section>

        <Section title="3. Damaged Items">
          <p>
            Customers must report defective or damaged products to customer service within
            2 days of receipt. The merchant verifies the claim before processing.
          </p>
        </Section>

        <Section title="4. Quality Concerns">
          <p>
            If products don&apos;t match website descriptions or customer expectations,
            notification must occur within 2 days of delivery for appropriate resolution.
          </p>
        </Section>

        <Section title="5. Warranty Claims">
          <p>
            Products with manufacturer warranties should be directed to the manufacturer
            for warranty-related issues.
          </p>
        </Section>

        <Section title="6. Refund Processing">
          <p>
            Approved refunds take 6&ndash;8 days to process.
          </p>
        </Section>

        <Section title="7. Undelivered Packages">
          <p>
            When packages are returned undelivered, both original and return shipping
            charges are deducted before refunding the balance.
          </p>
        </Section>

        <Section title="8. Cancellation Fees">
          <p>
            Approved cancellations or non-deliveries incur a 10% restocking fee deduction
            from the refund amount.
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
      <div className="text-sm text-gray-600 space-y-2">
        {children}
      </div>
    </div>
  );
}
