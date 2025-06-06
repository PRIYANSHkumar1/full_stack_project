import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { logout } from '../slices/authSlice';
import { isProduction, logDeploymentInfo } from '../utils/deploymentUtils';

const DeploymentErrorHandler = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Log deployment info for debugging
    logDeploymentInfo();

    // Global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Check if it's an authentication error
      if (event.reason?.status === 401 || 
          event.reason?.message?.includes('token') ||
          event.reason?.message?.includes('unauthorized')) {
        
        console.log('Authentication error detected in unhandled rejection');
        dispatch(logout({ clearCache: true }));
        navigate('/login');
        toast.error('Your session has expired. Please login again.');
      }
      
      // Prevent default browser error handling in production
      if (isProduction()) {
        event.preventDefault();
      }
    };

    // Global error handler for JavaScript errors
    const handleError = (event) => {
      console.error('Global JavaScript error:', event.error);
      
      // Log deployment-specific errors
      if (isProduction() && event.error?.message?.includes('Network')) {
        console.warn('Network error in production:', event.error);
      }
    };

    // Network status monitoring for deployment
    const handleOnline = () => {
      if (isProduction()) {
        console.log('Network connection restored');
        toast.success('Connection restored');
      }
    };

    const handleOffline = () => {
      if (isProduction()) {
        console.warn('Network connection lost');
        toast.warning('Network connection lost. Some features may not work.');
      }
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch, navigate]);

  return <>{children}</>;
};

export default DeploymentErrorHandler;
