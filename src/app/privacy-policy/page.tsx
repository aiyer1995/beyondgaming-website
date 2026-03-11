export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-500 mb-2">
          Legal
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900">
          Privacy Policy
        </h1>
      </div>

      <div className="space-y-8">
        <Section title="Overview">
          <p>
            This privacy policy outlines how Beyond Gaming utilizes and safeguards any
            information provided by users when accessing its website.
          </p>
          <p>
            Beyond Gaming is dedicated to safeguarding your privacy. Any information
            requested on this website will be used solely in accordance with this privacy
            statement.
          </p>
          <p>
            Beyond Gaming may revise this policy periodically by updating this page. Users
            are encouraged to check this page regularly to stay informed about any changes.
          </p>
        </Section>

        <Section title="Information Collected">
          <p>We gather the following types of data:</p>
          <ul>
            <li>Name and job title</li>
            <li>Contact information such as email address</li>
            <li>Demographic details like postcode, preferences, and interests</li>
            <li>Other information pertinent to customer surveys or offers</li>
          </ul>
        </Section>

        <Section title="Information Usage">
          <p>The gathered information is utilized for:</p>
          <ul>
            <li>Internal record keeping</li>
            <li>Enhancing products and services</li>
            <li>
              Periodically sending promotional emails regarding new products, special
              offers, or other relevant information to the provided email address
            </li>
            <li>
              Conducting market research via email, phone, fax, or mail to customize
              website content based on user interests
            </li>
          </ul>
        </Section>

        <Section title="Security">
          <p>
            Beyond Gaming ensures the security of user information through appropriate
            measures to prevent unauthorized access or disclosure.
          </p>
        </Section>

        <Section title="Cookie Usage">
          <p>
            A cookie is a small file stored on the user&apos;s computer hard drive upon
            permission. Cookies help analyze web traffic and notify users about site visits.
            They enable web applications to customize operations based on user preferences.
          </p>
          <p>
            The site employs traffic log cookies to identify frequently visited pages,
            enhancing website content. This information is used for statistical analysis
            before being removed from the system.
          </p>
          <p>
            Cookies do not provide access to your computer or personal information beyond
            the data you choose to share. You can choose to accept or decline cookies
            through your browser settings.
          </p>
        </Section>

        <Section title="Links to Other Websites">
          <p>
            Our website may contain links to other websites of interest. However, once you
            use these links to leave our site, we do not have any control over those
            external websites. We cannot be responsible for the protection and privacy of
            any information you provide while visiting such sites, and they are not governed
            by this privacy statement.
          </p>
        </Section>

        <Section title="Controlling Your Personal Information">
          <p>You may choose to restrict the collection or use of your personal information:</p>
          <ul>
            <li>
              If you have previously agreed to us using your personal information for
              direct marketing purposes, you may change your mind at any time by emailing
              us at{" "}
              <a href="mailto:contact@beyondgaming.in" className="text-purple-600 hover:text-purple-800 font-medium">
                contact@beyondgaming.in
              </a>
            </li>
            <li>
              We will not sell, distribute, or lease your personal information to third
              parties unless required by law
            </li>
          </ul>
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
