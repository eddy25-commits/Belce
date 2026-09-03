import { SITE } from "../config/site";
import { usePageMeta } from "../hooks/usePageMeta";
import "./StaticPage.css";

export default function PrivacyPolicy() {
  usePageMeta(
    "Privacy Policy",
    `How Belce collects, uses, and protects your information when you shop with us.`
  );

  return (
    <div className="container static-page">
      <span className="eyebrow">Your Information</span>
      <h1>Privacy Policy</h1>
      <hr className="gold-rule" />

      <div className="static-page-content">
        <p>
          This policy explains what information we collect when you shop with{" "}
          {SITE.businessName}, how we use it, and how we protect it.
        </p>

        <h2>Information we collect</h2>
        <p>When you place an order, we collect the details you provide at checkout:</p>
        <ul className="policy-list">
          <li>Your name, email address, and phone number</li>
          <li>Your delivery address and city</li>
          <li>Any order notes you choose to add</li>
        </ul>
        <p>
          We do not collect or store your card or mobile money details ourselves
          — payments are processed securely by Paystack, our payment provider
          (see below).
        </p>

        <h2>How we use your information</h2>
        <ul className="policy-list">
          <li>To process and deliver your order</li>
          <li>To contact you about your order, including any issues raised under our Return &amp; Refund Policy</li>
          <li>To respond to questions you send us by phone or WhatsApp</li>
        </ul>
        <p>
          We do not sell or rent your personal information to third parties, and
          we only use it for the purposes described here.
        </p>

        <h2>Payment processing</h2>
        <p>
          All payments on this site are handled by Paystack, a licensed payment
          processor. When you pay, your card or mobile money details are sent
          directly to Paystack over a secure, encrypted connection — we never
          see or store this information. Please refer to{" "}
          <a href="https://paystack.com/terms" target="_blank" rel="noreferrer">
            Paystack&rsquo;s own privacy policy
          </a>{" "}
          for details on how they handle payment data.
        </p>

        <h2>How long we keep your information</h2>
        <p>
          We keep order records for as long as reasonably necessary to fulfil
          orders, handle any returns or disputes, and meet our own record-keeping
          needs.
        </p>

        <h2>Your rights</h2>
        <p>
          You can ask us at any time what information we hold about you, request
          a correction, or ask us to delete it (where we&rsquo;re not required to
          keep it for legal or accounting reasons). Just contact us using the
          details below.
        </p>

        <h2>Contact us</h2>
        <p>
          If you have any questions about this policy or how your information is
          handled, reach out to us at <a href={SITE.phoneHref}>{SITE.phone}</a> or
          via{" "}
          <a href={SITE.whatsappHref} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          , or visit us at {SITE.fullAddress}.
        </p>

        <p className="policy-note">
          This policy may be updated from time to time as our business grows;
          please check back occasionally for the latest version.
        </p>
      </div>
    </div>
  );
}
