import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,
  isAuthenticated: localStorage.getItem('userInfo') ? true : false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
      
      // Set expiration check for localStorage
      const expirationTime = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
      localStorage.setItem('tokenExpiration', expirationTime.toString());
    },
    logout: (state, action) => {
      state.userInfo = null;
      state.isAuthenticated = false;
      
      // Clear all auth-related localStorage items
      localStorage.removeItem('userInfo');
      localStorage.removeItem('tokenExpiration');
      
      // Clear any other potential auth-related data
      localStorage.removeItem('cartItems');
      
      // For deployment debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth state cleared:', {
          clearCache: action.payload?.clearCache,
          timestamp: new Date().toISOString()
        });
      }
      
      // Clear any cached data
      if (action.payload && action.payload.clearCache) {
        // This will be handled by RTK Query cache invalidation
        if (process.env.NODE_ENV === 'development') {
          console.log('Cache clear requested during logout');
        }
      }
    },
    checkTokenExpiration: (state) => {
      const expirationTime = localStorage.getItem('tokenExpiration');
      if (expirationTime && Date.now() > parseInt(expirationTime)) {
        state.userInfo = null;
        state.isAuthenticated = false;
        localStorage.removeItem('userInfo');
        localStorage.removeItem('tokenExpiration');
      }
    },
    updateCredentials: (state, action) => {
      if (state.userInfo) {
        state.userInfo = { ...state.userInfo, ...action.payload };
        localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
      }
    }
  }
});

export const { setCredentials, logout, checkTokenExpiration, updateCredentials } = authSlice.actions;

export default authSlice.reducer;
