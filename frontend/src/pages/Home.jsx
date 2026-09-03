import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { SITE } from "../config/site";
import { usePageMeta } from "../hooks/usePageMeta";
import "./Home.css";

// Each collection gets its own hand-drawn line icon (not stock photography) so
// the hero can show the range of what Belce carries the moment someone lands,
// without depending on product photography that may not exist yet.
const COLLECTIONS = [
  {
    name: "Watches",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 10h12l1.4 6.4M18 38h12l1.4-6.4M14.6 16.4h18.8v15.2H14.6z" />
        <circle cx="24" cy="24" r="9.4" />
        <path d="M24 19v5l3.6 2.2" />
      </svg>
    ),
  },
  {
    name: "Sneakers",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 30.5c0-2 1.4-3 3-3.6l7.6-2.8c1-.4 1.7-1.2 2-2.2l1.3-4.4c.4-1.4 1.8-2.2 3.2-1.8l1.8.6c1 .3 1.6 1.3 1.5 2.3l-.3 2.7c-.1 1.2.7 2.3 1.9 2.5l10.4 1.9c1.4.3 2.6 1.5 2.6 3v3.4c0 1.3-1 2.4-2.3 2.4H8.3C7 34.5 6 33.5 6 32.2z" />
        <path d="M17 22.5c2.4 1.6 5.3 2.6 8.3 2.9M23 17.3c.9 1.7 2.3 3.1 4 4.1" />
      </svg>
    ),
  },
  {
    name: "Bracelets",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="24" cy="26" rx="12" ry="8.6" />
        <path d="M14.5 19.5c2.4-2.4 6-3.9 9.5-3.9s7.1 1.5 9.5 3.9" />
        <path d="M22 15.8 24 12l2 3.8" />
      </svg>
    ),
  },
  {
    name: "Clothes",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 9.5a3.4 3.4 0 0 1 3.4 3.4H20.6A3.4 3.4 0 0 1 24 9.5Z" />
        <path d="M24 12.9 10 21l3 5 5.4-3v15.6h11.2V23l5.4 3 3-5-14-8.1Z" />
      </svg>
    ),
  },
];

export default function Home() {
  usePageMeta(
    null,
    "Shop watches, sneakers, bracelets, and clothes in Kumasi, Ghana. Secure Paystack checkout, with delivery across Ghana."
  );
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products", { params: { featured: true } })
      .then((res) => setFeatured(res.data.slice(0, 8)))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content">
            <span className="eyebrow">Kumasi, Ghana</span>
            <h1 className="hero-title">One address for the pieces you reach for daily</h1>
            <hr className="gold-rule" />
            <p className="hero-copy">
              Belce brings watches, sneakers, bracelets, and clothes together under one
              trusted store — sourced with care and delivered across Ghana.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-gold">
                Shop the Collection
              </Link>
              <a href={SITE.whatsappHref} target="_blank" rel="noreferrer" className="btn btn-outline hero-outline">
                Chat With Us
              </a>
            </div>
          </div>

          <div className="hero-mosaic" aria-label="Shop by collection">
            {COLLECTIONS.map((c, i) => (
              <Link
                key={c.name}
                to={`/shop?category=${encodeURIComponent(c.name)}`}
                className="hero-mosaic-card"
                style={{ "--i": i }}
              >
                <span className="hero-mosaic-icon">{c.icon}</span>
                <span className="hero-mosaic-name">{c.name}</span>
                <span className="hero-mosaic-arrow" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="categories">
        <div className="container">
          <span className="eyebrow">Explore</span>
          <h2>Shop by Collection</h2>
          <hr className="gold-rule" />
          <div className="category-grid">
            {SITE.categories.map((cat) => (
              <Link key={cat} to={`/shop?category=${encodeURIComponent(cat)}`} className="category-tile">
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="featured">
        <div className="container">
          <span className="eyebrow">Handpicked</span>
          <h2>Featured Products</h2>
          <hr className="gold-rule" />
          {loading ? (
            <Loader label="Loading products..." />
          ) : featured.length === 0 ? (
            <p className="featured-empty">
              New arrivals coming soon — check back shortly or browse the full shop.
            </p>
          ) : (
            <div className="product-grid">
              {featured.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
          <div className="featured-cta">
            <Link to="/shop" className="btn btn-outline">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      <section className="promise">
        <div className="container promise-grid">
          <div className="promise-item">
            <h3>Genuine Products</h3>
            <p>Every item is carefully sourced and quality checked before it reaches you.</p>
          </div>
          <div className="promise-item">
            <h3>Delivery Across Ghana</h3>
            <p>Fast local delivery within Kumasi, with reliable delivery nationwide.</p>
          </div>
          <div className="promise-item">
            <h3>Secure Payment</h3>
            <p>Pay safely online in Ghana cedis via Paystack — cards, mobile money, and more.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
