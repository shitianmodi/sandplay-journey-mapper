
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, hasConsent } = useAuth();
  const location = useLocation();
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // If authenticated but hasn't given consent and trying to access 
  // pages other than the consent page, redirect to consent
  if (!hasConsent && location.pathname !== "/consent") {
    return <Navigate to="/consent" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
