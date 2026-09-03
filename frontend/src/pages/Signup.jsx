import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/client";
import { usePageMeta } from "../hooks/usePageMeta";
import "./Auth.css";

export default function Signup() {
  usePageMeta("Create Account");
  const { signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";

  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const data = await signUp({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        phone: form.phone,
      });
      if (data.session) {
        navigate(redirectTo);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container auth-page">
        <div className="auth-card card">
          <span className="eyebrow">Almost Done</span>
          <h1>Check Your Email</h1>
          <hr className="gold-rule" />
          <p>
            We&rsquo;ve sent a confirmation link to <strong>{form.email}</strong>. Verify your
            email to activate your account, then sign in.
          </p>
          <Link to="/login" className="btn btn-gold btn-block">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container auth-page">
      <form className="auth-card card" onSubmit={handleSubmit}>
        <span className="eyebrow">Join Belce</span>
        <h1>Create an Account</h1>
        <hr className="gold-rule" />

        {error && <div className="alert alert-error">{error}</div>}

        <div className="field">
          <label htmlFor="fullName">Full Name</label>
          <input id="fullName" name="fullName" required value={form.fullName} onChange={handleChange} />
        </div>

        <div className="field">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label htmlFor="phone">Phone Number</label>
          <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={form.password}
            onChange={handleChange}
            placeholder="At least 8 characters"
          />
        </div>

        <button type="submit" className="btn btn-gold btn-block" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to={`/login?redirect=${encodeURIComponent(redirectTo)}`}>Sign in</Link>
        </p>
        <p className="auth-switch">
          Just browsing? <Link to="/checkout">Continue as guest</Link>
        </p>
      </form>
    </div>
  );
}
