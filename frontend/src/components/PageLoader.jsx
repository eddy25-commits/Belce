import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "./PageLoader.css";

const ACTIVE_MS = 480;

export default function PageLoader() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip on the very first mount — the splash screen already covers that.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), ACTIVE_MS);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className="page-loader" role="status" aria-label="Loading page">
      <div className="page-loader-bar" />
    </div>
  );
}
