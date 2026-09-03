import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/client";
import { usePageMeta } from "../hooks/usePageMeta";
import "./Auth.css";

export default function Login() {
  usePageMeta("Sign In");
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn({ email, password });
      navigate(redirectTo);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container auth-page">
      <form className="auth-card card" onSubmit={handleSubmit}>
        <span className="eyebrow">Welcome Back</span>
        <h1>Sign In</h1>
        <hr className="gold-rule" />

        {error && <div className="alert alert-error">{error}</div>}

        <div className="field">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-gold btn-block" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="auth-switch">
          New to Belce? <Link to={`/signup?redirect=${encodeURIComponent(redirectTo)}`}>Create an account</Link>
        </p>
        <p className="auth-switch">
          Prefer not to sign in? <Link to="/checkout">Continue as guest</Link>
        </p>
      </form>
    </div>
  );
}
