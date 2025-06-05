import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, checkTokenExpiration } from '../slices/authSlice';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { toast } from 'react-toastify';

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector(state => state.auth);
  const [logoutMutation] = useLogoutMutation();

  useEffect(() => {
    let intervalId;

    if (userInfo) {
      // Check token expiration every minute
      intervalId = setInterval(() => {
        dispatch(checkTokenExpiration());
        
        // Check if user was logged out due to expiration
        const currentUserInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
        if (userInfo && !currentUserInfo) {
          toast.error('Your session has expired. Please login again.');
          navigate('/login');
        }
      }, 60000); // Check every minute
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [userInfo, dispatch, navigate]);

  // Handle API 401 errors globally
  useEffect(() => {
    const handleUnauthorized = async () => {
      try {
        await logoutMutation().unwrap();
      } catch (error) {
        // Ignore logout errors
      } finally {
        dispatch(logout({ clearCache: true }));
        toast.error('Your session has expired. Please login again.');
        navigate('/login');
      }
    };

    // Listen for 401 errors from RTK Query
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401 && userInfo) {
        handleUnauthorized();
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [userInfo, dispatch, navigate, logoutMutation]);

  return <>{children}</>;
};

export default AuthProvider;
