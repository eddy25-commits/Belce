import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import api, { getErrorMessage } from "../../api/client";
import Loader from "../../components/Loader";
import { SITE } from "../../config/site";
import "./AdminProductForm.css";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: SITE.categories[0],
  brand: "",
  stock: "",
  isFeatured: false,
};

const MAX_IMAGES = 5;

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState([]);
  const [removeImageIds, setRemoveImageIds] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/products/${id}`)
      .then((res) => {
        const p = res.data;
        setForm({
          name: p.name,
          description: p.description,
          price: p.price,
          category: p.category,
          brand: p.brand || "",
          stock: p.stock,
          isFeatured: p.isFeatured,
        });
        setExistingImages(p.images || []);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const activeImageCount = existingImages.length - removeImageIds.length + newFiles.length;
  const slotsLeft = Math.max(0, MAX_IMAGES - activeImageCount);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const addFiles = (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
    const allowed = files.slice(0, slotsLeft);
    if (!allowed.length) return;
    setNewFiles((prev) => [...prev, ...allowed]);
    setNewPreviews((prev) => [...prev, ...allowed.map((f) => URL.createObjectURL(f))]);
  };

  const handleFilesSelected = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (slotsLeft > 0) addFiles(e.dataTransfer.files);
  };

  const removeNewFile = (idx) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleRemoveExisting = (publicId) => {
    setRemoveImageIds((prev) =>
      prev.includes(publicId) ? prev.filter((id) => id !== publicId) : [...prev, publicId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.description || !form.price || !form.category) {
      setError("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("brand", form.brand);
      formData.append("stock", form.stock || 0);
      formData.append("isFeatured", form.isFeatured);
      newFiles.forEach((file) => formData.append("images", file));
      removeImageIds.forEach((path) => formData.append("removeImagePaths", path));

      if (isEdit) {
        await api.put(`/products/${id}`, formData);
      } else {
        await api.post("/products", formData);
      }
      navigate("/admin/products");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const visibleExisting = useMemo(
    () => existingImages.filter((img) => !removeImageIds.includes(img.path)),
    [existingImages, removeImageIds]
  );
  const isCover = (index) => index === 0;

  if (loading) return <AdminLayout><Loader label="Loading product..." /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="product-form-header">
        <div>
          <span className="eyebrow">{isEdit ? "Edit Item" : "New Item"}</span>
          <h1>{isEdit ? "Edit Product" : "Add New Product"}</h1>
        </div>
      </div>
      <hr className="gold-rule" />

      {error && <div className="alert alert-error">{error}</div>}

      <form className="product-form" onSubmit={handleSubmit}>
        <div className="product-form-grid">
          <div className="form-card card">
            <h2 className="form-card-title">Product Details</h2>
            <p className="form-card-subtitle">The essentials customers will see on the shop page.</p>

            <div className="field">
              <label htmlFor="name">Product Name *</label>
              <input
                id="name"
                name="name"
                placeholder="e.g. Classic Chronograph Watch"
                required
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe the product, its benefits, and how to use it..."
                required
                rows={5}
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="product-form-row">
              <div className="field">
                <label htmlFor="price">Price (GHS) *</label>
                <div className="input-prefix-group">
                  <span className="input-prefix">GHS</span>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                    value={form.price}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="stock">Stock Quantity</label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.stock}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="product-form-row">
              <div className="field">
                <label htmlFor="category">Category *</label>
                <select id="category" name="category" required value={form.category} onChange={handleChange}>
                  {SITE.categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="brand">Brand (optional)</label>
                <input
                  id="brand"
                  name="brand"
                  placeholder="e.g. Rolex, Nike, Fossil"
                  value={form.brand}
                  onChange={handleChange}
                />
              </div>
            </div>

            <label className="feature-toggle">
              <span className="feature-toggle-text">
                <span className="feature-toggle-title">Feature on homepage</span>
                <span className="feature-toggle-hint">Shown in the “Handpicked” section on the storefront.</span>
              </span>
              <span className="switch">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange}
                />
                <span className="switch-track" aria-hidden="true" />
              </span>
            </label>
          </div>

          <div className="form-card card">
            <div className="form-card-title-row">
              <div>
                <h2 className="form-card-title">Product Images</h2>
                <p className="form-card-subtitle">First photo is used as the cover image.</p>
              </div>
              <span className="image-count-badge">
                {activeImageCount}/{MAX_IMAGES}
              </span>
            </div>

            <div className="product-image-grid">
              {visibleExisting.map((img, idx) => (
                <div key={img.path} className="product-image-tile">
                  {isCover(idx) && <span className="product-image-cover-tag">Cover</span>}
                  <img src={img.url} alt="" />
                  <button
                    type="button"
                    className="product-image-remove"
                    aria-label="Remove image"
                    onClick={() => toggleRemoveExisting(img.path)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              ))}

              {existingImages
                .filter((img) => removeImageIds.includes(img.path))
                .map((img) => (
                  <div key={img.path} className="product-image-tile is-removed">
                    <img src={img.url} alt="" />
                    <button
                      type="button"
                      className="product-image-undo"
                      onClick={() => toggleRemoveExisting(img.path)}
                    >
                      Undo
                    </button>
                  </div>
                ))}

              {newPreviews.map((src, idx) => (
                <div key={src} className="product-image-tile">
                  {isCover(visibleExisting.length + idx) && (
                    <span className="product-image-cover-tag">Cover</span>
                  )}
                  <img src={src} alt="" />
                  <button
                    type="button"
                    className="product-image-remove"
                    aria-label="Remove image"
                    onClick={() => removeNewFile(idx)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              ))}

              {slotsLeft > 0 && (
                <label
                  className={`product-image-dropzone ${dragActive ? "is-dragging" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                >
                  <input type="file" accept="image/*" multiple hidden onChange={handleFilesSelected} />
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path
                      d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Add Photos</span>
                </label>
              )}
            </div>

            <p className="product-form-hint">JPG, PNG, or WEBP &middot; up to 5 photos &middot; max 5MB each</p>
          </div>
        </div>

        <div className="product-form-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate("/admin/products")}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
