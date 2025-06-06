// Deployment utility functions for handling production-specific issues

export const isProduction = () => process.env.NODE_ENV === 'production';

export const getBaseUrl = () => {
  if (isProduction()) {
    return 'https://full-stack-project-backend-n1gf.onrender.com';
  }
  return 'http://localhost:4000';
};

export const handleLogoutError = (error, dispatch, logout, navigate, toast) => {
  console.error('Logout error details:', {
    status: error?.status,
    message: error?.data?.message || error?.message,
    error: error
  });
  
  // Always clear local state regardless of server response
  dispatch(logout({ clearCache: true }));
  
  // Navigate to login
  navigate('/login');
  
  // Show success message to user (since local logout is what matters)
  toast.success('Logout successful');
  
  // Log additional debug info in development
  if (!isProduction()) {
    console.warn('Logout completed locally despite API error:', error);
  }
};

export const retryApiCall = async (apiCall, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      console.warn(`API call attempt ${i + 1} failed:`, error);
      
      if (i === maxRetries - 1) {
        throw error; // Re-throw on final attempt
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

export const checkNetworkConnectivity = async () => {
  try {
    const response = await fetch('/api/v1/health', {
      method: 'GET',
      cache: 'no-cache'
    });
    return response.ok;
  } catch (error) {
    console.warn('Network connectivity check failed:', error);
    return false;
  }
};

export const logDeploymentInfo = () => {
  if (isProduction()) {
    console.log('Running in production mode');
    console.log('Backend URL:', getBaseUrl());
    console.log('Frontend URL:', window.location.origin);
  } else {
    console.log('Running in development mode');
  }
};

export const isCorsError = (error) => {
  return error?.message?.includes('CORS') || 
         error?.data?.message?.includes('CORS') ||
         error?.status === 0; // Often indicates CORS issues
};

export const isNetworkError = (error) => {
  return error?.status === 'FETCH_ERROR' ||
         error?.status === 'TIMEOUT_ERROR' ||
         error?.name === 'NetworkError' ||
         !navigator.onLine;
};
  try {
    const response = await fetch('/api/v1/health', {
      method: 'GET',
      cache: 'no-cache'
    });
    return response.ok;
  } catch (error) {
    console.warn('Network connectivity check failed:', error);
    return false;
  }
};

export const logDeploymentInfo = () => {
  if (isProduction()) {
    console.log('Deployment Info:', {
      environment: 'production',
      baseUrl: getBaseUrl(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  }
};
