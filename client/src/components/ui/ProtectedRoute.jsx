import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const ProtectedRoute = ({ children, admin = false }) => {
  const { user } = useAuth();

  if (!user) {
    if (admin) return <Navigate to="/admin/login" replace />;
    return <Navigate to="/login" replace />;
  }

  if (admin && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
