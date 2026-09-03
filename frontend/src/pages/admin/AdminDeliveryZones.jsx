import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api, { getErrorMessage } from "../../api/client";
import Loader from "../../components/Loader";
import "./AdminDeliveryZones.css";

const emptyForm = {
  name: "",
  scope: "ghana",
  fee: "",
  sortOrder: 0,
  isActive: true,
  isFree: false,
};

export default function AdminDeliveryZones() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadZones = () => {
    setLoading(true);
    api
      .get("/delivery-zones/admin/all")
      .then((res) => setZones(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadZones();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "isFree") {
      setForm((prev) => ({
        ...prev,
        isFree: checked,
        fee: checked ? "0" : prev.fee,
      }));
      return;
    }

    if (name === "fee") {
      setForm((prev) => ({
        ...prev,
        fee: value,
        isFree: value === "0" || value === 0,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please provide a delivery area name.");
      return;
    }

    if (form.fee === "" || form.fee === null) {
      setError("Please provide a delivery fee or mark the area as free delivery.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        scope: form.scope,
        fee: Number(form.fee),
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      };

      if (editingId) {
        await api.put(`/delivery-zones/${editingId}`, payload);
      } else {
        await api.post("/delivery-zones", payload);
      }

      resetForm();
      loadZones();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (zone) => {
    setEditingId(zone.id);
    setForm({
      name: zone.name,
      scope: zone.scope,
      fee: zone.fee,
      sortOrder: zone.sortOrder ?? 0,
      isActive: zone.isActive,
      isFree: Number(zone.fee) === 0,
    });
  };

  const handleDelete = async (zone) => {
    if (!window.confirm(`Delete "${zone.name}"?`)) return;

    try {
      await api.delete(`/delivery-zones/${zone.id}`);
      loadZones();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <AdminLayout>
      <div className="admin-zones-header">
        <div>
          <span className="eyebrow">Delivery Settings</span>
          <h1>Delivery Zones & Charges</h1>
        </div>
      </div>
      <hr className="gold-rule" />

      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-zones-grid">
        <form className="card admin-zones-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit Zone" : "Add New Zone"}</h2>

          <div className="field">
            <label htmlFor="zone-name">Zone name</label>
            <input
              id="zone-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Kumasi, Accra, Nigeria"
            />
          </div>

          <div className="field">
            <label htmlFor="zone-scope">Scope</label>
            <select id="zone-scope" name="scope" value={form.scope} onChange={handleChange}>
              <option value="ghana">Ghana</option>
              <option value="international">International</option>
            </select>
          </div>

          <label className="toggle-row free-delivery-toggle">
            <input type="checkbox" name="isFree" checked={form.isFree} onChange={handleChange} />
            <span>Free delivery for this area</span>
          </label>

          <div className="field">
            <label htmlFor="zone-fee">Delivery fee (GHS)</label>
            <input
              id="zone-fee"
              name="fee"
              type="number"
              min="0"
              step="0.01"
              value={form.fee}
              onChange={handleChange}
              placeholder="0.00"
              disabled={form.isFree}
            />
          </div>

          <div className="field">
            <label htmlFor="zone-sort">Display order</label>
            <input
              id="zone-sort"
              name="sortOrder"
              type="number"
              min="0"
              value={form.sortOrder}
              onChange={handleChange}
            />
          </div>

          <label className="toggle-row">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
            <span>Visible to customers</span>
          </label>

          <div className="admin-zones-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Zone" : "Add Zone"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="card admin-zones-list-wrap">
          <h2>Saved Zones</h2>

          {loading ? (
            <Loader label="Loading delivery zones..." />
          ) : zones.length === 0 ? (
            <p className="dashboard-empty">No delivery zones yet.</p>
          ) : (
            <div className="admin-zones-list">
              {zones.map((zone) => (
                <div key={zone.id} className="admin-zone-item">
                  <div>
                    <div className="admin-zone-name-row">
                      <strong>{zone.name}</strong>
                      <span className={`badge ${zone.isActive ? "badge-success" : "badge-error"}`}>
                        {zone.isActive ? "Active" : "Hidden"}
                      </span>
                    </div>
                    <div className="admin-zone-meta">
                      <span>{zone.scope}</span>
                      <span>Fee: {Number(zone.fee).toFixed(2)} GHS</span>
                      <span>Order: {zone.sortOrder ?? 0}</span>
                    </div>
                  </div>

                  <div className="admin-zone-actions">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => handleEdit(zone)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-outline btn-sm admin-delete-btn" onClick={() => handleDelete(zone)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
