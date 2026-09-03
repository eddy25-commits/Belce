import { SITE } from "../config/site";
import { usePageMeta } from "../hooks/usePageMeta";
import "./StaticPage.css";

export default function ReturnPolicy() {
  usePageMeta(
    "Return & Refund Policy",
    `Return and refund policy for Belce. Contact us immediately if there's an issue with your order — claims made after 2 days of delivery cannot be accepted.`
  );

  return (
    <div className="container static-page">
      <span className="eyebrow">Please Read Before You Shop</span>
      <h1>Return &amp; Refund Policy</h1>
      <hr className="gold-rule" />

      <div className="static-page-content">
        <div className="policy-highlight">
          <strong>The most important rule:</strong> if you receive your order and
          notice something wrong — the wrong item, a damaged product, or anything
          else that doesn&rsquo;t look right — you must contact us{" "}
          <strong>immediately, as soon as you receive the product</strong>. Requests
          made more than <strong>2 days</strong> after you received your order will{" "}
          <strong>not</strong> be accepted, no exceptions.
        </div>

        <h2>How to report an issue</h2>
        <p>
          As soon as you notice a problem with your order, reach out to us right
          away by phone or WhatsApp at{" "}
          <a href={SITE.phoneHref}>{SITE.phone}</a>. Please have your order number
          ready, and where possible, a clear photo of the product and its
          packaging — this helps us resolve things quickly.
        </p>

        <h2>Our 2-day window</h2>
        <p>
          We take pride in the quality of everything we sell, and we want to make
          things right if something goes wrong on our end. That said, we can only
          do this if you let us know promptly:
        </p>
        <ul className="policy-list">
          <li>You must contact us immediately upon receiving your order if anything is wrong.</li>
          <li>Any return, exchange, or refund request must be raised within 2 days of delivery.</li>
          <li>Requests made after this 2-day window will not be accepted under any circumstances.</li>
        </ul>

        <h2>Condition of returned items</h2>
        <p>
          For hygiene, safety, and quality reasons, items must be unused, unworn, and
          returned in their original packaging with tags attached
          to be considered for a return or exchange, unless the product itself
          arrived damaged or defective.
        </p>

        <h2>What happens next</h2>
        <p>
          Once you&rsquo;ve reported an issue within the 2-day window, we&rsquo;ll
          review your case and agree with you on the best resolution — whether
          that&rsquo;s a replacement, an exchange, or a refund. We aim to resolve
          every valid claim as quickly as possible.
        </p>

        <h2>Damaged or incorrect items</h2>
        <p>
          If your order arrives visibly damaged or you received the wrong item,
          please don&rsquo;t use or open the product further — contact us straight
          away with the details above so we can sort it out for you.
        </p>

        <p className="policy-note">
          This policy applies to purchases made through our online store. If you
          have any questions before placing an order, feel free to reach out to us
          at <a href={SITE.phoneHref}>{SITE.phone}</a> or via{" "}
          <a href={SITE.whatsappHref} target="_blank" rel="noreferrer">
            WhatsApp
          </a>{" "}
          — we&rsquo;re happy to help.
        </p>
      </div>
    </div>
  );
}
