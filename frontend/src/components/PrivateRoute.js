import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';

const PrivateRoute = ({ children }) => {
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

  return children;
};

export default PrivateRoute;
