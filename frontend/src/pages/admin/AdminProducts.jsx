import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import api, { getErrorMessage } from "../../api/client";
import Loader from "../../components/Loader";
import { formatGHS } from "../../config/site";
import "./AdminDashboard.css";
import "./AdminProducts.css";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadProducts = () => {
    setLoading(true);
    api
      .get("/products/admin/all")
      .then((res) => setProducts(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadProducts, []);

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setBusyId(product._id);
    try {
      await api.delete(`/products/${product._id}`);
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleActive = async (product) => {
    setBusyId(product._id);
    try {
      const formData = new FormData();
      formData.append("isActive", String(!product.isActive));
      const res = await api.put(`/products/${product._id}`, formData);
      setProducts((prev) => prev.map((p) => (p._id === product._id ? res.data : p)));
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-products-header">
        <h1>Products</h1>
        <Link to="/admin/products/new" className="btn btn-primary btn-sm">
          Add Product
        </Link>
      </div>
      <hr className="gold-rule" />

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <Loader label="Loading products..." />
      ) : products.length === 0 ? (
        <p className="dashboard-empty">
          No products yet. <Link to="/admin/products/new">Add your first product</Link>.
        </p>
      ) : (
        <div className="dashboard-table-wrap card">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td data-label="Image">
                    <div className="admin-product-thumb">
                      {p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.name} /> : null}
                    </div>
                  </td>
                  <td data-label="Name">{p.name}</td>
                  <td data-label="Category">{p.category}</td>
                  <td data-label="Price">{formatGHS(p.price)}</td>
                  <td data-label="Stock">{p.stock}</td>
                  <td data-label="Status">
                    <span className={`badge ${p.isActive ? "badge-success" : "badge-error"}`}>
                      {p.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div className="admin-product-actions">
                      <Link to={`/admin/products/${p._id}/edit`} className="btn btn-outline btn-sm">
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        disabled={busyId === p._id}
                        onClick={() => handleToggleActive(p)}
                      >
                        {p.isActive ? "Hide" : "Show"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm admin-delete-btn"
                        disabled={busyId === p._id}
                        onClick={() => handleDelete(p)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
