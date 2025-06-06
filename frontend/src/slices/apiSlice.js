import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../constants';
import { logout } from './authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: 'include', // Include cookies with requests
  prepareHeaders: (headers, { getState }) => {
    headers.set('content-type', 'application/json');
    headers.set('Accept', 'application/json');
    
    // Add additional headers for deployment compatibility
    if (process.env.NODE_ENV === 'production') {
      headers.set('Cache-Control', 'no-cache');
    }
    
    return headers;
  },
  // Add timeout for deployment scenarios
  timeout: 30000, // 30 seconds
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // Handle different types of errors in deployment
  if (result.error) {
    const { status, data } = result.error;
    
    // Handle 401 unauthorized responses
    if (status === 401) {
      console.log('401 error detected, clearing auth state');
      api.dispatch(logout({ clearCache: true }));
      api.dispatch(apiSlice.util.resetApiState());
    }
    
    // Handle network errors in production
    if (status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR') {
      console.warn('Network error in API call:', result.error);
      
      // For logout operations, don't treat network errors as failures
      if (args.url && args.url.includes('/logout')) {
        console.log('Logout network error handled gracefully');
        return {
          data: { message: 'Logout completed locally' }
        };
      }
    }
    
    // Handle CORS errors
    if (data && data.message && data.message.includes('CORS')) {
      console.error('CORS error detected:', data.message);
    }
  }
  
  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Product', 'Order'],
  endpoints: builder => ({}),
  // Add middleware to handle cache clearing on logout
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === 'auth/logout' && action.payload?.clearCache) {
      return {};
    }
  }
});
                                                              