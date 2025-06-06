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

  // Attempt to extract message from common patterns, ensuring a string is returned
  if (typeof error?.data?.message === 'string') {
    return error.data.message;
  }
  if (typeof error?.error?.data?.message === 'string') {
    return error.error.data.message;
  }
  
  // Handle cases where error.error might be an object with a message property, or a string itself
  if (error?.error) {
    if (typeof error.error === 'string') {
      return error.error;
    }
    // Check if error.error is an object and has a string message property
    if (typeof error.error.message === 'string') {
      return error.error.message;
    }
  }
  
  if (typeof error?.message === 'string') {
    return error.message;
  }

  return 'An unknown error occurred. Please try again.';
};
