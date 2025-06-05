import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = () => {
  const { isAuthenticated, isTokenExpired } = useAuth();
  const location = useLocation();

  if (isTokenExpired()) {
    // Token expired, redirect to login
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  if (!isAuthenticated) {
    // Not authenticated, redirect to login
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
