import { Link } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta";

export default function NotFound() {
  usePageMeta("Page Not Found");

  return (
    <div className="container" style={{ padding: "100px 0", textAlign: "center" }}>
      <span className="eyebrow">404</span>
      <h1>Page Not Found</h1>
      <p style={{ color: "#777", marginBottom: 24 }}>
        The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
      </p>
      <Link to="/" className="btn btn-gold">
        Back to Home
      </Link>
    </div>
  );
}
