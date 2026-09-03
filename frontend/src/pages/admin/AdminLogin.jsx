import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { getErrorMessage } from "../../api/client";
import "./AdminLogin.css";

export default function AdminLogin() {
  const { signIn, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAdmin) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await signIn({ email, password });
      if (!user?.app_metadata?.is_admin) {
        await supabase.auth.signOut();
        setError("This account is not authorized as an admin.");
        return;
      }
      navigate("/admin");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login-card card" onSubmit={handleSubmit}>
        <span className="admin-login-ring">
          <img src="/logo.svg" alt="Belce" className="admin-login-mark" />
        </span>
        <h1>Admin Login</h1>
        <p className="admin-login-sub">Belce</p>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="admin-login-password-wrap">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="admin-login-password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path
                    d="M3 3l18 18M10.6 10.7a2.5 2.5 0 0 0 3.5 3.5M6.7 6.9C4.6 8.3 3 10.4 2 12c1.6 2.7 4.9 7 10 7 1.8 0 3.3-.5 4.6-1.2M9.9 4.4A9.9 9.9 0 0 1 12 4c5.1 0 8.4 4.3 10 7-.5.9-1.2 1.9-2 2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path
                    d="M2 12c1.6-2.7 4.9-7 10-7s8.4 4.3 10 7c-1.6 2.7-4.9 7-10 7s-8.4-4.3-10-7Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="admin-login-actions">
          <button type="button" className="btn btn-outline btn-block admin-login-back" onClick={() => navigate("/")}>
            Back
          </button>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
}
