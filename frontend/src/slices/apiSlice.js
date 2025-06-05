import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../constants';
import { logout } from './authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: 'include', // Include cookies with requests
  prepareHeaders: (headers, { getState }) => {
    headers.set('content-type', 'application/json');
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // Handle 401 unauthorized responses
  if (result.error && result.error.status === 401) {
    // Clear auth state on 401 error
    api.dispatch(logout({ clearCache: true }));
    
    // Reset API cache
    api.dispatch(apiSlice.util.resetApiState());
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
                                                              