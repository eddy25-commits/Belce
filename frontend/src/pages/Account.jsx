import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { getErrorMessage } from "../api/client";
import { formatGHS } from "../config/site";
import { usePageMeta } from "../hooks/usePageMeta";
import "./TrackOrder.css";
import "./Auth.css";

const STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function Account() {
  usePageMeta("My Account");
  const { user, signOut } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/orders/mine")
      .then((res) => setOrders(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container account-page">
      <span className="eyebrow">My Account</span>
      <h1>{user?.user_metadata?.full_name || "Your Account"}</h1>
      <hr className="gold-rule" />

      <div className="account-summary card">
        <div>
          <span className="account-summary-label">Email</span>
          <p>{user?.email}</p>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => signOut()}>
          Sign Out
        </button>
      </div>

      <h2 className="account-orders-heading">Order History</h2>

      {loading ? (
        <p>Loading your orders...</p>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : orders.length === 0 ? (
        <div className="account-empty card">
          <p>You haven&rsquo;t placed any orders with this account yet.</p>
          <Link to="/shop" className="btn btn-gold">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="account-orders">
          {orders.map((order) => (
            <div key={order.id} className="account-order card">
              <div className="account-order-header">
                <div>
                  <span className="account-order-number">{order.orderNumber}</span>
                  <span className="account-order-date">
                    {new Date(order.createdAt).toLocaleDateString("en-GH", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <span className={`track-status-badge ${order.orderStatus}`}>
                  {STATUS_LABELS[order.orderStatus] || order.orderStatus}
                </span>
              </div>
              <div className="account-order-items">
                {order.items?.map((item) => (
                  <div key={`${order.id}-${item.productId}`} className="account-order-item">
                    <span>
                      {item.name} &times; {item.quantity}
                    </span>
                    <span>{formatGHS(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="account-order-total">
                <span>Total</span>
                <strong>{formatGHS(order.total)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
