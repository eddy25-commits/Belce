import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

export default function ProtectedRoute({ children }) {
  const { isAdmin, loading } = useAuth();

  if (loading) return <Loader label="Checking session..." />;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  return children;
}
