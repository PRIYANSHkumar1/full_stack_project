import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRefreshTokenMutation } from '../slices/usersApiSlice';
import { setCredentials, logout } from '../slices/authSlice';

const TokenInterceptor = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);
  const [refreshToken] = useRefreshTokenMutation();

  useEffect(() => {
    let refreshTimer;

    const scheduleTokenRefresh = () => {
      const expirationTime = localStorage.getItem('tokenExpiration');
      if (expirationTime && userInfo) {
        const timeUntilExpiry = parseInt(expirationTime) - Date.now();
        const refreshTime = timeUntilExpiry - (60 * 60 * 1000); // Refresh 1 hour before expiry

        if (refreshTime > 0) {
          refreshTimer = setTimeout(async () => {
            try {
              const refreshedUser = await refreshToken().unwrap();
              dispatch(setCredentials(refreshedUser));
              // Schedule next refresh
              scheduleTokenRefresh();
            } catch (error) {
              console.error('Automatic token refresh failed:', error);
              dispatch(logout({ clearCache: true }));
            }
          }, refreshTime);
        }
      }
    };

    if (userInfo) {
      scheduleTokenRefresh();
    }

    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
    };
  }, [userInfo, refreshToken, dispatch]);

  return null; // This component doesn't render anything
};

export default TokenInterceptor;
