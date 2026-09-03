import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { getErrorMessage } from "../../api/client";
import "./AdminChangePassword.css";

export default function AdminChangePassword() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (form.newPassword !== form.confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Re-verify identity with the current password before changing it
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: form.currentPassword,
      });
      if (reauthError) {
        setError("Current password is incorrect.");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: form.newPassword,
      });
      if (updateError) throw updateError;

      setSuccess("Password updated successfully.");
      setForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-change-password-wrap">
        <div className="admin-change-password-card card">
          <div className="admin-change-password-header">
            <div>
              <span className="eyebrow">Security</span>
              <h1>Change Password</h1>
            </div>
            <Link to="/admin" className="btn btn-outline btn-sm">
              Back to Dashboard
            </Link>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="admin-change-password-form">
            <div className="field">
              <label htmlFor="currentPassword">Current Password</label>
              <div className="admin-login-password-wrap">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your current password"
                  value={form.currentPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="admin-login-password-toggle"
                  onClick={() => setShowCurrentPassword((v) => !v)}
                  aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                  aria-pressed={showCurrentPassword}
                >
                  {showCurrentPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="field">
              <label htmlFor="newPassword">New Password</label>
              <div className="admin-login-password-wrap">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter a new password"
                  value={form.newPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="admin-login-password-toggle"
                  onClick={() => setShowNewPassword((v) => !v)}
                  aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                  aria-pressed={showNewPassword}
                >
                  {showNewPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="field">
              <label htmlFor="confirmNewPassword">Confirm New Password</label>
              <div className="admin-login-password-wrap">
                <input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Confirm your new password"
                  value={form.confirmNewPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="admin-login-password-toggle"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  aria-pressed={showConfirmPassword}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="admin-change-password-actions">
              <button type="button" className="btn btn-outline" onClick={() => navigate("/admin")}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
