import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AdminLayout.css";

export default function AdminLayout({ children }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: "/admin", label: "Overview", end: true },
    { to: "/admin/products", label: "Products" },
    { to: "/admin/products/new", label: "Add Product" },
    { to: "/admin/delivery-zones", label: "Delivery Charges" },
    { to: "/admin/orders", label: "Orders" },
  ];

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="container admin-topbar-inner">
          <div className="admin-topbar-brand">
            <span className="admin-topbar-ring">
              <img src="/logo.svg" alt="" className="admin-topbar-mark" />
            </span>
            <span className="admin-topbar-text">
              <span className="admin-topbar-name">Belce Admin</span>
              <span className="admin-topbar-sub">Kumasi, Ghana</span>
            </span>
          </div>

          <nav className={`admin-topbar-links ${menuOpen ? "is-open" : ""}`}>
            {links.map((link, i) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `admin-nav-link ${isActive ? "is-active" : ""}`}
                style={{ "--i": i }}
              >
                {link.label}
              </NavLink>
            ))}
            <div className="admin-topbar-user" style={{ "--i": links.length }}>
              Signed in as <strong>{user?.email}</strong>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm admin-logout-btn"
              style={{ "--i": links.length + 1 }}
              onClick={() => navigate("/admin/change-password")}
            >
              Change Password
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm admin-logout-btn"
              style={{ "--i": links.length + 2 }}
              onClick={handleLogout}
            >
              Log Out
            </button>
          </nav>

          <button
            type="button"
            className={`admin-burger ${menuOpen ? "is-open" : ""}`}
            aria-label="Toggle admin menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <main className="admin-content">
        <div className="container admin-content-inner">{children}</div>
      </main>
    </div>
  );
}
