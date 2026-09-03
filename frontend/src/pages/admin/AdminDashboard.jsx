import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import api from "../../api/client";
import Loader from "../../components/Loader";
import { formatGHS } from "../../config/site";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/products/admin/all"), api.get("/orders")])
      .then(([productsRes, ordersRes]) => {
        setProducts(productsRes.data);
        setOrders(ordersRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const lowStock = products.filter((p) => p.isActive && p.stock <= 5).length;
  const pendingOrders = orders.filter((o) => o.orderStatus === "pending" || o.orderStatus === "processing").length;

  if (loading) return <AdminLayout><Loader label="Loading dashboard..." /></AdminLayout>;

  return (
    <AdminLayout>
      <h1>Overview</h1>
      <hr className="gold-rule" />

      <div className="stat-grid">
        <div className="stat-card card">
          <span className="stat-label">Total Products</span>
          <span className="stat-value">{products.length}</span>
        </div>
        <div className="stat-card card">
          <span className="stat-label">Paid Orders</span>
          <span className="stat-value">{paidOrders.length}</span>
        </div>
        <div className="stat-card card">
          <span className="stat-label">Total Revenue</span>
          <span className="stat-value">{formatGHS(totalRevenue)}</span>
        </div>
        <div className="stat-card card">
          <span className="stat-label">Low Stock Items</span>
          <span className="stat-value">{lowStock}</span>
        </div>
      </div>

      <div className="dashboard-quicklinks">
        <Link to="/admin/products/new" className="btn btn-primary">
          Add New Product
        </Link>
        <Link to="/admin/orders" className="btn btn-outline">
          View Orders {pendingOrders > 0 && `(${pendingOrders} pending)`}
        </Link>
      </div>

      <h2 className="dashboard-subheading">Recent Orders</h2>
      {orders.length === 0 ? (
        <p className="dashboard-empty">No orders yet.</p>
      ) : (
        <div className="dashboard-table-wrap card">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map((o) => (
                <tr key={o._id}>
                  <td data-label="Order">{o.orderNumber}</td>
                  <td data-label="Customer">{o.customer.name}</td>
                  <td data-label="Total">{formatGHS(o.total)}</td>
                  <td data-label="Payment">
                    <span className={`badge ${o.paymentStatus === "paid" ? "badge-success" : "badge-error"}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td data-label="Status">{o.orderStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
