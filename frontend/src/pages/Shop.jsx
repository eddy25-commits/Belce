import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/client";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { SITE } from "../config/site";
import { usePageMeta } from "../hooks/usePageMeta";
import "./Shop.css";
export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "All";
  usePageMeta(
    category !== "All" ? `${category} | Shop` : "Shop",
    `Browse ${category !== "All" ? category.toLowerCase() : "watches, sneakers, bracelets, and clothes"} from Belce, with GHS pricing and secure Paystack checkout.`
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    setLoading(true);
    setError("");
    const params = {};
    if (category !== "All") params.category = category;
    const currentSearch = searchParams.get("search");
    if (currentSearch) params.search = currentSearch;
    api
      .get("/products", { params })
      .then((res) => setProducts(res.data))
      .catch(() => setError("Could not load products. Please try again shortly."))
      .finally(() => setLoading(false));
  }, [category, searchParams]);
  const handleCategoryClick = (cat) => {
    const next = new URLSearchParams(searchParams);
    if (cat === "All") next.delete("category");
    else next.set("category", cat);
    setSearchParams(next);
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (search.trim()) next.set("search", search.trim());
    else next.delete("search");
    setSearchParams(next);
  };
  return (
    <div className="shop-page">
      <div className="container">
        <span className="eyebrow">The Collection</span>
        <h1>Shop All Products</h1>
        <hr className="gold-rule" />
        <form className="shop-search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Search for a product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
          <button type="submit" className="btn btn-gold btn-sm">
            Search
          </button>
        </form>
        <div className="shop-categories">
          {["All", ...SITE.categories].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`shop-category-pill ${category === cat ? "is-active" : ""}`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        {loading ? (
          <Loader label="Loading products..." />
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : products.length === 0 ? (
          <p className="shop-empty">No products found. Try a different category or search term.</p>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}