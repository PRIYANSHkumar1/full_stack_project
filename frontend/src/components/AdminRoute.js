import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AdminRoute = ({ children }) => {
  const { userInfo, isAuthenticated, isTokenExpired } = useAuth();
  const location = useLocation();

  if (isTokenExpired()) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  if (!userInfo?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
