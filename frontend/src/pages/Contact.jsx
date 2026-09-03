import { SITE } from "../config/site";
import { usePageMeta } from "../hooks/usePageMeta";
import "./StaticPage.css";

export default function Contact() {
  usePageMeta(
    "Contact Us",
    `Reach Belce in ${SITE.fullAddress} by phone, WhatsApp, or email at ${SITE.email}.`
  );

  return (
    <div className="container static-page">
      <span className="eyebrow">Get In Touch</span>
      <h1>Contact Us</h1>
      <hr className="gold-rule" />
      <div className="contact-grid">
        <div className="contact-item card">
          <h3>Location</h3>
          <p>{SITE.fullAddress}</p>
        </div>
        <div className="contact-item card">
          <h3>Call Us</h3>
          <p>
            <a href={SITE.phoneHref}>{SITE.phone}</a>
          </p>
        </div>
        <div className="contact-item card">
          <h3>WhatsApp</h3>
          <p>
            <a href={SITE.whatsappHref} target="_blank" rel="noreferrer">
              {SITE.whatsapp} — Message us directly
            </a>
          </p>
        </div>
        <div className="contact-item card">
          <h3>Email</h3>
          <p>
            <a href={SITE.emailHref}>{SITE.email}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
