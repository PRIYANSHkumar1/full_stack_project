import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AdminRoute = () => {
  const { userInfo, isAuthenticated, isTokenExpired } = useAuth();
  const location = useLocation();

  if (isTokenExpired()) {
    return <Navigate to={`/admin/login?redirect=${location.pathname}`} replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/admin/login?redirect=${location.pathname}`} replace />;
  }

  if (!userInfo?.isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
