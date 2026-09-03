import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { SITE } from "../config/site";
import "./Navbar.css";

export default function Navbar() {
  const { itemCount, setIsOpen } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <span className="navbar-logo-ring">
            <img src="/logo.svg" alt="Belce" className="navbar-logo-mark" />
          </span>
          <span className="navbar-logo-text">
            <span className="navbar-logo-name">Drip Sync</span>
          </span>
        </Link>

        <nav className={`navbar-links ${menuOpen ? "is-open" : ""}`}>
          {links.map((link, i) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) => `navbar-link ${isActive ? "is-active" : ""}`}
              style={{ "--i": i }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <a
            className="navbar-link-phone"
            href={SITE.phoneHref}
            style={{ "--i": links.length }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {SITE.phone}
          </a>
          <Link
            to="/track-order"
            className="navbar-link navbar-track-order"
            onClick={() => setMenuOpen(false)}
          >
            Track Order
          </Link>
          <Link
            to={isAuthenticated ? "/account" : "/login"}
            className="navbar-link navbar-track-order"
            onClick={() => setMenuOpen(false)}
          >
            {isAuthenticated ? "My Account" : "Sign In / Register"}
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="navbar-admin-login"
              onClick={() => setMenuOpen(false)}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="navbar-actions">
          <button
            type="button"
            className="navbar-cart"
            onClick={() => setIsOpen(true)}
            aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path
                d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2.3 5H17M17 18a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM9 18a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {itemCount > 0 && <span className="navbar-cart-count">{itemCount}</span>}
          </button>

          <button
            type="button"
            className={`navbar-burger ${menuOpen ? "is-open" : ""}`}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
