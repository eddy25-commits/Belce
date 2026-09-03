import { SITE } from "../config/site";
import { usePageMeta } from "../hooks/usePageMeta";
import "./StaticPage.css";

export default function TermsOfService() {
  usePageMeta(
    "Terms of Service",
    `Terms of service for shopping at Belce, covering orders, pricing, payment, and delivery.`
  );

  return (
    <div className="container static-page">
      <span className="eyebrow">The Fine Print</span>
      <h1>Terms of Service</h1>
      <hr className="gold-rule" />

      <div className="static-page-content">
        <p>
          These terms apply whenever you browse or shop on the {SITE.businessName}{" "}
          website. By placing an order with us, you agree to the terms below.
        </p>

        <h2>Products and pricing</h2>
        <p>
          We do our best to describe and price every product accurately. All
          prices on this site are listed in Ghana cedis (GHS) and may change
          without prior notice. In the rare case a product is listed at an
          incorrect price, we will contact you before processing your order to
          confirm whether you&rsquo;d like to proceed at the correct price.
        </p>

        <h2>Order acceptance</h2>
        <p>
          Placing an order and completing payment does not automatically
          guarantee availability. If an item you ordered is out of stock or
          otherwise unavailable, we will contact you to arrange a replacement,
          refund, or other resolution.
        </p>

        <h2>Payment</h2>
        <p>
          All payments are processed securely through Paystack. We accept the
          payment methods available through Paystack at checkout, including
          major cards and mobile money. Your order is only confirmed once
          payment has been successfully verified.
        </p>

        <h2>Delivery</h2>
        <p>
          We deliver within Kumasi and to other locations across Ghana.
          Delivery fees are shown at checkout and vary depending on your
          location. Estimated delivery times may vary depending on your
          location and product availability; we&rsquo;ll keep you informed if
          there are any delays.
        </p>

        <h2>Returns and refunds</h2>
        <p>
          Our full return and refund terms — including the requirement to
          contact us immediately upon receiving your order if there&rsquo;s an
          issue — are set out in our{" "}
          <a href="/returns">Return &amp; Refund Policy</a>, which forms part of
          these terms.
        </p>

        <h2>Product use</h2>
        <p>
          Our products are intended for personal use as directed on their
          packaging. If you have any known allergies or sensitivities, please
          review product ingredients carefully, or contact us before purchasing
          if you&rsquo;re unsure.
        </p>

        <h2>Intellectual property</h2>
        <p>
          All content on this site — including our logo, product photography,
          and written descriptions — belongs to {SITE.businessName} and may not
          be copied or reused without our permission.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          We work hard to ensure the products and information on this site are
          accurate and reliable, but we cannot guarantee the site will always be
          error-free or uninterrupted. To the extent permitted by law, we are
          not liable for indirect or consequential losses arising from your use
          of this site.
        </p>

        <h2>Governing law</h2>
        <p>These terms are governed by the laws of Ghana.</p>

        <h2>Contact us</h2>
        <p>
          Questions about these terms can be sent to us at{" "}
          <a href={SITE.phoneHref}>{SITE.phone}</a> or via{" "}
          <a href={SITE.whatsappHref} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          , or by visiting us at {SITE.fullAddress}.
        </p>

        <p className="policy-note">
          These terms may be updated from time to time; the version shown on
          our site at the time of your order applies to that order.
        </p>
      </div>
    </div>
  );
}
