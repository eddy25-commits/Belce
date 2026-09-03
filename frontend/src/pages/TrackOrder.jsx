import { useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/client";
import { formatGHS } from "../config/site";
import { usePageMeta } from "../hooks/usePageMeta";
import "./TrackOrder.css";

const STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function TrackOrder() {
  usePageMeta("Track Order");
  const [form, setForm] = useState({ orderNumber: "", email: "", phone: "" });
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.orderNumber.trim() && (!form.email.trim() || !form.phone.trim())) {
      setError("Please enter your order number or both email and phone number.");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams();

      if (form.orderNumber.trim()) params.set("orderNumber", form.orderNumber.trim());
      if (form.email.trim()) params.set("email", form.email.trim());
      if (form.phone.trim()) params.set("phone", form.phone.trim());

      const res = await api.get(`/orders/track?${params.toString()}`);
      setOrder(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container track-order-page">
      <span className="eyebrow">Order Support</span>
      <h1>Track Your Order</h1>
      <hr className="gold-rule" />

      <div className="track-order-grid">
        <form className="card track-order-card" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="orderNumber">Order Number</label>
            <input
              id="orderNumber"
              name="orderNumber"
              value={form.orderNumber}
              onChange={handleChange}
              placeholder="Optional if you know email + phone"
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your order email"
            />
          </div>

          <div className="field">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="Your order phone"
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button type="submit" className="btn btn-gold btn-block" disabled={loading}>
            {loading ? "Checking order..." : "Track Order"}
          </button>
        </form>

        <div className="card track-order-result">
          {!order ? (
            <div>
              <h2>Need a hand?</h2>
              <p>Enter your order number or the email and phone used during checkout to see your order status.</p>
              <Link to="/contact" className="btn btn-outline btn-sm">
                Contact Us
              </Link>
            </div>
          ) : (
            <>
              <span className="eyebrow">Order Status</span>
              <h2>{order.orderNumber}</h2>
              <div className={`track-status-badge ${order.orderStatus}`}>
                {STATUS_LABELS[order.orderStatus] || order.orderStatus}
              </div>

              <div className="track-order-meta">
                <div>
                  <span>Payment</span>
                  <strong>{order.paymentStatus}</strong>
                </div>
                <div>
                  <span>Delivery</span>
                  <strong>{order.deliveryZoneName || "Not specified"}</strong>
                </div>
                <div>
                  <span>Total</span>
                  <strong>{formatGHS(order.total)}</strong>
                </div>
              </div>

              <div className="track-order-items">
                {order.items?.map((item) => (
                  <div key={`${order.orderNumber}-${item.productId}-${item.name}`} className="track-order-item">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{formatGHS(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
