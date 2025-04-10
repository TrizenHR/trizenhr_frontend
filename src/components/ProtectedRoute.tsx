
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: 'admin' | 'user';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required and user doesn't have it, redirect
  if (requiredRole && userRole !== requiredRole) {
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard/employee-list" replace />;
    } else if (userRole === 'user') {
      return <Navigate to="/user/dashboard" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
