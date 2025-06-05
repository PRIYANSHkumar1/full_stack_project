import { apiSlice } from '../slices/apiSlice';

export const clearAllCache = (dispatch) => {
  // Reset all RTK Query cache
  dispatch(apiSlice.util.resetApiState());
  
  // Clear localStorage auth data
  localStorage.removeItem('userInfo');
  localStorage.removeItem('tokenExpiration');
  
  // Clear any other cached data if needed
  // sessionStorage.clear();
};

export const invalidateUserCache = (dispatch) => {
  // Invalidate specific user-related cache
  dispatch(apiSlice.util.invalidateTags(['User']));
};

export const refreshUserData = (dispatch) => {
  // Refresh user-related queries
  dispatch(apiSlice.util.invalidateTags(['User']));
};
