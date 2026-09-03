import { Link } from "react-router-dom";
import { formatGHS } from "../config/site";
import { useCart } from "../context/CartContext";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const image = product.images?.[0]?.url;
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;

  return (
    <div className="product-card">
      <Link to={`/product/${product._id}`} className="product-card-image-wrap">
        {image ? (
          <img src={image} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-card-placeholder">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="8.5" cy="10" r="1.5" />
              <path d="M21 16.5 16 11l-8 8" />
            </svg>
            <span>No Image</span>
          </div>
        )}
        <div className="product-card-badges">
          {outOfStock && <span className="product-card-badge product-card-oos">Out of Stock</span>}
          {product.isFeatured && !outOfStock && (
            <span className="product-card-badge product-card-featured">&#10022; Featured</span>
          )}
          {lowStock && <span className="product-card-badge product-card-lowstock">Only {product.stock} left</span>}
        </div>
      </Link>
      <div className="product-card-body">
        <span className="product-card-category">{product.category}</span>
        <Link to={`/product/${product._id}`} className="product-card-name-link">
          <h3 className="product-card-name">{product.name}</h3>
        </Link>
        <div className="product-card-footer">
          <span className="product-card-price">{formatGHS(product.price)}</span>
          <button
            type="button"
            className="btn btn-gold btn-sm product-card-add"
            disabled={outOfStock}
            onClick={() => addItem(product, 1)}
          >
            {outOfStock ? "Sold Out" : "Add to Bag"}
          </button>
        </div>
      </div>
    </div>
  );
}