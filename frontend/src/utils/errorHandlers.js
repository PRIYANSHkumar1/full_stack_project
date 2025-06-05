import { toast } from 'react-toastify';

export const handleAuthError = (error, dispatch, logout, navigate) => {
  console.error('Authentication error:', error);
  
  if (error?.status === 401 || error?.data?.message?.includes('token') || error?.data?.message?.includes('expired')) {
    toast.error('Your session has expired. Please login again.');
    dispatch(logout({ clearCache: true }));
    navigate('/login');
    return true; // Indicates this was an auth error
  }
  
  return false; // Not an auth error
};

export const isAuthError = (error) => {
  return error?.status === 401 || 
         error?.data?.message?.toLowerCase().includes('token') ||
         error?.data?.message?.toLowerCase().includes('expired') ||
         error?.data?.message?.toLowerCase().includes('authentication') ||
         error?.data?.message?.toLowerCase().includes('unauthorized');
};

export const getErrorMessage = (error) => {
  if (isAuthError(error)) {
    return 'Your session has expired. Please login again.';
  }
  
  return error?.data?.message || error?.message || 'An error occurred. Please try again.';
};
