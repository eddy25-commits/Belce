import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api, { getErrorMessage } from "../api/client";
import { formatGHS } from "../config/site";
import { usePageMeta } from "../hooks/usePageMeta";
import "./Checkout.css";

export default function Checkout() {
  usePageMeta("Checkout");
  const { items, subtotal, clearCart } = useCart();
  const { user, isAuthenticated, signUp, signOut } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: user?.user_metadata?.phone || "",
    notes: "",
  });
  const [createAccount, setCreateAccount] = useState(false);
  const [accountPassword, setAccountPassword] = useState("");
  const [deliveryZones, setDeliveryZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [accountNotice, setAccountNotice] = useState("");

  useEffect(() => {
    api
      .get("/delivery-zones")
      .then((res) => {
        setDeliveryZones(res.data || []);
      })
      .catch(() => {
        setError("Unable to load delivery regions right now. Please refresh and try again.");
      });
  }, []);

  const selectedZone = deliveryZones.find((zone) => String(zone.id) === String(selectedZoneId)) || null;
  const deliveryFee = selectedZone ? Number(selectedZone.fee) : 0;
  const total = useMemo(() => subtotal + deliveryFee, [subtotal, deliveryFee]);
  const deliveryLabel = deliveryFee === 0 ? "Free" : formatGHS(deliveryFee);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setAccountNotice("");

    if (items.length === 0) {
      setError("Your bag is empty. Add some products before checking out.");
      return;
    }

    if (!selectedZoneId) {
      setError("Please select a delivery region.");
      return;
    }

    if (!isAuthenticated && createAccount && accountPassword.length < 8) {
      setError("Choose a password of at least 8 characters to create your account.");
      return;
    }

    setSubmitting(true);

    // Guests can optionally create an account alongside checkout. This never
    // blocks the order — if it fails (e.g. the email is already registered),
    // we simply continue with a normal guest checkout.
    if (!isAuthenticated && createAccount) {
      try {
        await signUp({ email: form.email, password: accountPassword, fullName: form.name, phone: form.phone });
        setAccountNotice(
          "We've started your account — check your email to confirm it before your next order."
        );
      } catch (err) {
        setAccountNotice(`Couldn't create an account (${getErrorMessage(err)}) — continuing as guest.`);
      }
    }

    try {
      const payload = {
        customer: form,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
        })),
        deliveryZoneId: Number(selectedZoneId),
        deliveryFee,
      };

      const res = await api.post("/payment/initialize", payload);
      // Keep the cart until the payment is confirmed. Clearing it immediately can
      // make the bag appear empty before the customer reaches Paystack.
      sessionStorage.setItem("belce_last_reference", res.data.reference);
      window.location.href = res.data.authorizationUrl;
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container checkout-empty">
        <h1>Your Bag is Empty</h1>
        <p>Add a few favorites before checking out.</p>
        <Link to="/shop" className="btn btn-gold">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container checkout-page">
      <span className="eyebrow">Almost There</span>
      <h1>Checkout</h1>
      <hr className="gold-rule" />

      {isAuthenticated ? (
        <div className="checkout-account-banner">
          Signed in as <strong>{user.email}</strong> — this order will be saved to your account.{" "}
          <button type="button" className="checkout-account-link" onClick={() => signOut()}>
            Not you? Sign out
          </button>
        </div>
      ) : (
        <div className="checkout-account-banner">
          Checking out as a guest. Have an account?{" "}
          <Link to="/login?redirect=/checkout" className="checkout-account-link">
            Sign in for faster checkout
          </Link>
        </div>
      )}

      <div className="checkout-grid">
        <form className="checkout-form card" onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          {accountNotice && <div className="alert alert-success">{accountNotice}</div>}

          <div className="field">
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" required value={form.name} onChange={handleChange} />
          </div>

          <div className="field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              disabled={isAuthenticated}
              value={form.email}
              onChange={handleChange}
              placeholder="For your payment receipt"
            />
          </div>

          <div className="field">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={form.phone}
              onChange={handleChange}
              placeholder="e.g. 024xxxxxxx"
            />
          </div>

          <div className="field">
            <label htmlFor="deliveryZone">Select your delivery area</label>
            <select
              id="deliveryZone"
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              required
            >
              <option value="">Choose your delivery area</option>
              {deliveryZones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name} {Number(zone.fee) === 0 ? "- Free" : `- ${formatGHS(zone.fee)}`}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="notes">Order Notes (optional)</label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              value={form.notes}
              onChange={handleChange}
              placeholder="Any special instructions"
            />
          </div>

          {!isAuthenticated && (
            <div className="checkout-create-account">
              <label className="checkout-checkbox-row">
                <input
                  type="checkbox"
                  checked={createAccount}
                  onChange={(e) => setCreateAccount(e.target.checked)}
                />
                <span>Create an account with these details for faster checkout next time</span>
              </label>
              {createAccount && (
                <div className="field">
                  <label htmlFor="accountPassword">Choose a Password</label>
                  <input
                    id="accountPassword"
                    type="password"
                    minLength={8}
                    required={createAccount}
                    value={accountPassword}
                    onChange={(e) => setAccountPassword(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                </div>
              )}
            </div>
          )}

          <button type="submit" className="btn btn-gold btn-block" disabled={submitting}>
            {submitting ? "Redirecting to Paystack..." : `Pay ${formatGHS(total)} with Paystack`}
          </button>
          <p className="checkout-secure-note">
            You&rsquo;ll be redirected to Paystack&rsquo;s secure page to complete payment by card
            or mobile money.
          </p>
          <p className="checkout-secure-note">
            By placing this order, you agree to our{" "}
            <Link to="/terms">Terms of Service</Link> and{" "}
            <Link to="/returns">Return &amp; Refund Policy</Link>.
          </p>
        </form>

        <div className="checkout-summary card">
          <h2>Order Summary</h2>
          {items.map((item) => (
            <div className="checkout-summary-item" key={item.productId}>
              <span>
                {item.name} &times; {item.quantity}
              </span>
              <span>{formatGHS(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="checkout-summary-row">
            <span>Subtotal</span>
            <span>{formatGHS(subtotal)}</span>
          </div>
          <div className="checkout-summary-row">
            <span>Delivery ({selectedZone ? selectedZone.name : "Not selected"})</span>
            <span>{deliveryLabel}</span>
          </div>
          <div className="checkout-summary-row checkout-summary-total">
            <span>Total</span>
            <span>{formatGHS(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
