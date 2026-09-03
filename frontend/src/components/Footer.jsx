import { useState } from "react";
import { Link } from "react-router-dom";
import { SITE } from "../config/site";
import "./Footer.css";

export default function Footer() {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (id) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-col footer-brand">
          <div className="footer-logo">
            <span className="footer-logo-ring">
              <img src="/logo-light.svg" alt="Belce" className="footer-logo-mark" />
            </span>
            <span className="footer-logo-text">
              <span className="footer-logo-name">Belce</span>
              <span className="footer-logo-sub">Kumasi, Ghana</span>
            </span>
          </div>
          <p className="footer-tagline">
            Watches, sneakers, bracelets, and clothes — one trusted store, delivered
            across Ghana.
          </p>
        </div>

        <div className="footer-col footer-accordion">
          <button
            type="button"
            className="footer-heading footer-toggle"
            onClick={() => toggleSection("visit")}
            aria-expanded={openSection === "visit"}
          >
            Get in Touch
            <svg className="footer-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className={`footer-col-content ${openSection === "visit" ? "is-open" : ""}`}>
            <p>{SITE.fullAddress}</p>
            <p>
              <a href={SITE.phoneHref}>{SITE.phone}</a>
            </p>
            <p>
              <a href={SITE.emailHref}>{SITE.email}</a>
            </p>
            <p>
              <a
                href={SITE.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="footer-whatsapp-link"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.33 5L2 22l5.2-1.36a9.94 9.94 0 0 0 4.83 1.23h.01c5.5 0 9.96-4.46 9.96-9.96S17.53 2 12.03 2zm5.83 14.24c-.25.7-1.24 1.28-2.03 1.45-.54.11-1.24.2-3.6-.77-3.02-1.25-4.96-4.32-5.11-4.52-.15-.2-1.22-1.62-1.22-3.09s.75-2.19 1.02-2.49c.26-.3.57-.37.76-.37.19 0 .38 0 .55.01.18.01.41-.07.64.49.25.6.85 2.07.92 2.22.07.15.12.33.02.53-.09.2-.14.32-.28.5-.14.17-.29.38-.42.51-.14.14-.28.29-.12.57.15.28.68 1.13 1.47 1.83 1.01.9 1.86 1.19 2.14 1.32.28.14.44.12.6-.07.16-.19.68-.79.86-1.06.18-.27.36-.22.6-.13.25.09 1.6.75 1.87.89.27.14.45.2.52.32.07.12.07.68-.18 1.37z" />
                </svg>
                Chat on WhatsApp
              </a>
            </p>
          </div>
        </div>

        <div className="footer-col footer-accordion">
          <button
            type="button"
            className="footer-heading footer-toggle"
            onClick={() => toggleSection("shop")}
            aria-expanded={openSection === "shop"}
          >
            Shop
            <svg className="footer-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className={`footer-col-content ${openSection === "shop" ? "is-open" : ""}`}>
            <p>
              <Link to="/shop">All Products</Link>
            </p>
            {SITE.categories.slice(0, 4).map((cat) => (
              <p key={cat}>
                <Link to={`/shop?category=${encodeURIComponent(cat)}`}>{cat}</Link>
              </p>
            ))}
            <p>
              <Link to="/track-order">Track Order</Link>
            </p>
          </div>
        </div>

        <div className="footer-col footer-accordion">
          <button
            type="button"
            className="footer-heading footer-toggle"
            onClick={() => toggleSection("policies")}
            aria-expanded={openSection === "policies"}
          >
            Company
            <svg className="footer-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className={`footer-col-content ${openSection === "policies" ? "is-open" : ""}`}>
            <p>
              <Link to="/about">About Us</Link>
            </p>
            <p>
              <Link to="/contact">Contact</Link>
            </p>
            <p>
              <Link to="/returns">Return &amp; Refund Policy</Link>
            </p>
            <p>
              <Link to="/privacy-policy">Privacy Policy</Link>
            </p>
            <p>
              <Link to="/terms">Terms of Service</Link>
            </p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">&copy; {new Date().getFullYear()} Belce. All rights reserved.</div>
      </div>
    </footer>
  );
}
