import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/client";
import Loader from "../components/Loader";
import { formatGHS } from "../config/site";
import { useCart } from "../context/CartContext";
import { usePageMeta } from "../hooks/usePageMeta";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  usePageMeta(
    product?.name,
    product ? `${product.name} — ${formatGHS(product.price)}. ${product.description}`.slice(0, 160) : undefined
  );

  useEffect(() => {
    if (!id || id === "undefined") {
      setLoading(false);
      setError("Product not found.");
      return;
    }

    setLoading(true);
    setError("");
    setAdded(false);
    setActiveImage(0);
    setQuantity(1);
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader label="Loading product..." />;

  if (error || !product) {
    return (
      <div className="container product-detail-error">
        <p>{error || "Product not found."}</p>
        <Link to="/shop" className="btn btn-outline">
          Back to Shop
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const images = product.images?.length ? product.images : [{ url: "" }];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images.map((img) => img.url).filter(Boolean),
    brand: product.brand || "Belce",
    offers: {
      "@type": "Offer",
      priceCurrency: "GHS",
      price: product.price,
      availability: outOfStock
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
  };

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
  };

  return (
    <div className="product-detail container">
      <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
      <div className="product-detail-breadcrumb">
        <Link to="/shop">Shop</Link> / <span>{product.category}</span>
      </div>

      <div className="product-detail-grid">
        <div className="product-gallery">
          <div className="product-gallery-main">
            {images[activeImage]?.url ? (
              <img src={images[activeImage].url} alt={product.name} />
            ) : (
              <div className="product-card-placeholder">No Image</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="product-gallery-thumbs">
              {images.map((img, idx) => (
                <button
                  key={img.url + idx}
                  type="button"
                  className={`product-gallery-thumb ${idx === activeImage ? "is-active" : ""}`}
                  onClick={() => setActiveImage(idx)}
                >
                  <img src={img.url} alt={`${product.name} ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          {product.brand && <p className="product-brand">by {product.brand}</p>}
          <div className="product-price">{formatGHS(product.price)}</div>

          <p className="product-description">{product.description}</p>

          <div className="product-stock">
            {outOfStock ? (
              <span className="badge badge-error">Out of Stock</span>
            ) : product.stock <= 5 ? (
              <span className="badge badge-gold">Only {product.stock} left</span>
            ) : (
              <span className="badge badge-success">In Stock</span>
            )}
          </div>

          {!outOfStock && (
            <div className="product-actions">
              <div className="product-qty">
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  &minus;
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                >
                  +
                </button>
              </div>
              <button type="button" className="btn btn-gold" onClick={handleAdd}>
                Add to Bag
              </button>
            </div>
          )}

          {added && <p className="product-added-msg">Added to your bag.</p>}
        </div>
      </div>
    </div>
  );
}