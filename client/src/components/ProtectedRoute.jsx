import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a]">
        <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user?.role ? String(user.role).toLowerCase() : '';
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to their respective dashboard if they try to access unauthorized role routes
    const dashboardPath = userRole === 'admin' 
      ? '/admin/dashboard' 
      : userRole === 'teacher' 
        ? '/teacher/dashboard' 
      : userRole === 'parent'
          ? '/parent/dashboard'
          : '/student/dashboard';
    
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
