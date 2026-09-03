import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api, { getErrorMessage } from "../../api/client";
import Loader from "../../components/Loader";
import { formatGHS } from "../../config/site";
import "./AdminDashboard.css";
import "./AdminOrders.css";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "completed", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    api
      .get("/orders")
      .then((res) => setOrders(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (order, newStatus) => {
    setUpdatingId(order._id);
    try {
      const res = await api.put(`/orders/${order._id}/status`, { orderStatus: newStatus });
      setOrders((prev) => prev.map((o) => (o._id === order._id ? res.data : o)));
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminLayout>
      <h1>Orders</h1>
      <hr className="gold-rule" />

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <Loader label="Loading orders..." />
      ) : orders.length === 0 ? (
        <p className="dashboard-empty">No orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card card" key={order._id}>
              <button
                type="button"
                className="order-card-header"
                onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
              >
                <div className="order-card-header-main">
                  <span className="order-number">{order.orderNumber}</span>
                  <span className="order-customer">{order.customer.name}</span>
                </div>
                <div className="order-card-header-meta">
                  <span className={`badge ${order.paymentStatus === "paid" ? "badge-success" : "badge-error"}`}>
                    {order.paymentStatus}
                  </span>
                  <span className="order-total">{formatGHS(order.total)}</span>
                  <span className="order-date">
                    {new Date(order.createdAt).toLocaleDateString("en-GB")}
                  </span>
                </div>
              </button>

              {expandedId === order._id && (
                <div className="order-card-body">
                  <div className="order-detail-grid">
                    <div>
                      <h4>Customer</h4>
                      <p>{order.customer.name}</p>
                      <p>{order.customer.email}</p>
                      <p>{order.customer.phone}</p>
                      <p>
                        {order.customer.address}, {order.customer.city}
                      </p>
                      {order.customer.notes && <p>Note: {order.customer.notes}</p>}
                    </div>
                    <div>
                      <h4>Items</h4>
                      {order.items.map((item, idx) => (
                        <div className="order-item-row" key={idx}>
                          <span>
                            {item.name} &times; {item.quantity}
                          </span>
                          <span>{formatGHS(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="order-item-row order-item-total">
                        <span>Total</span>
                        <span>{formatGHS(order.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="order-status-control">
                    <label htmlFor={`status-${order._id}`}>Fulfillment Status</label>
                    <select
                      id={`status-${order._id}`}
                      value={order.orderStatus}
                      disabled={updatingId === order._id}
                      onChange={(e) => handleStatusChange(order, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
