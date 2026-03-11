export default function ShippingDeliveryPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-500 mb-2">
          Legal
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900">
          Shipping & Delivery Policy
        </h1>
      </div>

      <div className="space-y-8">
        <Section title="1. Shipping Details">
          <p>
            We carefully package all items using bubble mailers and high-quality cardboard
            boxes to ensure safe delivery. As collectors ourselves who order online
            frequently, we understand the importance of secure packaging.
          </p>
        </Section>

        <Section title="2. Order Processing Time">
          <p>
            Orders are dispatched within two working days (Monday to Friday). You will
            receive email and SMS notifications with tracking numbers.
          </p>
          <p>
            If you don&apos;t receive tracking information within two days, please contact
            us via Instagram or at{" "}
            <a href="mailto:contact@beyondgaming.in" className="text-purple-600 hover:text-purple-800 font-medium">
              contact@beyondgaming.in
            </a>
            .
          </p>
        </Section>

        <Section title="3. Estimated Delivery Time">
          <p>
            Private courier services through Ship Rocket typically deliver within 3&ndash;5
            days. If issues occur, packages may be sent via Delhivery, Maruti Couriers,
            DTDC, or Professional Couriers instead.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-3">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> Cash on delivery (COD) is not available &mdash;
              all orders require prepayment through the payment gateway.
            </p>
          </div>
        </Section>

        <Section title="4. Refund & Cancellation Policy">
          <p>
            Trading card sales are final due to price volatility. Detailed product images
            are provided before purchase. Exceptions exist for same-day requests with
            sealed, original condition items.
          </p>
          <p>
            A 10% restocking fee applies to non-error returns. Refunds process within 2
            days if approved.
          </p>
        </Section>

        <Section title="5. Shipping Refund">
          <p>
            Multiple orders from one customer may qualify for excess shipping refunds. A
            flat &#8377;40 packaging fee is deducted if items are already packed before
            processing returns.
          </p>
        </Section>

        <Section title="6. International Pre-Orders">
          <p>
            Fixed pricing applies per agreement between Beyond Gaming and the customer.
            Customers bear all freight and customs charges with proof provided.
          </p>
          <p>
            Beyond Gaming is not responsible for packages opened during customs
            inspections.
          </p>
        </Section>

        <Section title="7. Domestic Pre-Orders">
          <p>
            Fixed pricing applies per agreement for locally sourced products.
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
