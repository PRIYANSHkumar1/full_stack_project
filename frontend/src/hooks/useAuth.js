import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLogoutMutation, useRefreshTokenMutation } from '../slices/usersApiSlice';
import { logout, checkTokenExpiration, setCredentials } from '../slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { userInfo, isAuthenticated } = useSelector(state => state.auth);
  const [logoutMutation] = useLogoutMutation();
  const [refreshTokenMutation] = useRefreshTokenMutation();

  // Check token expiration on component mount and periodically
  useEffect(() => {
    const checkAuth = async () => {
      dispatch(checkTokenExpiration());
      
      // Try to refresh token if user is authenticated but token might be expired soon
      const expirationTime = localStorage.getItem('tokenExpiration');
      if (userInfo && expirationTime) {
        const timeUntilExpiry = parseInt(expirationTime) - Date.now();
        const oneDayInMs = 24 * 60 * 60 * 1000;
        
        // Refresh token if it expires within 1 day
        if (timeUntilExpiry < oneDayInMs && timeUntilExpiry > 0) {
          try {
            const refreshedUser = await refreshTokenMutation().unwrap();
            dispatch(setCredentials(refreshedUser));
          } catch (error) {
            console.error('Token refresh failed:', error);
            // If refresh fails, logout user
            dispatch(logout({ clearCache: true }));
          }
        }
      }
    };

    // Check immediately
    checkAuth();

    // Check every 5 minutes
    const interval = setInterval(checkAuth, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [dispatch, userInfo, refreshTokenMutation]);

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state regardless of API call success
      dispatch(logout({ clearCache: true }));
    }
  };

  const isTokenExpired = () => {
    const expirationTime = localStorage.getItem('tokenExpiration');
    return expirationTime && Date.now() > parseInt(expirationTime);
  };

  return {
    userInfo,
    isAuthenticated: isAuthenticated && !isTokenExpired(),
    handleLogout,
    isTokenExpired
  };
};
