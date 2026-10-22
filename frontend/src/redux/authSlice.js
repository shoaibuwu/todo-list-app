import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../services/api';

// Safe parse user from localStorage
const getStoredUser = () => {
  try {
    const item = localStorage.getItem('taskflow_user');
    return item ? JSON.parse(item) : null;
  } catch (e) {
    return null;
  }
};

const initialAccessToken = localStorage.getItem('taskflow_access_token') || null;
const initialRefreshToken = localStorage.getItem('taskflow_refresh_token') || null;
const initialUser = getStoredUser();

/**
 * Async Thunk: Login
 */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/auth/login', credentials);
      const { user, accessToken, refreshToken } = response.data.data;

      localStorage.setItem('taskflow_access_token', accessToken);
      localStorage.setItem('taskflow_refresh_token', refreshToken);
      localStorage.setItem('taskflow_user', JSON.stringify(user));
      localStorage.setItem('taskflow_last_active', Date.now().toString());

      return { user, accessToken, refreshToken };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      return rejectWithValue(msg);
    }
  }
);

/**
 * Async Thunk: Signup
 */
export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/auth/signup', userData);
      const { user, accessToken, refreshToken } = response.data.data;

      localStorage.setItem('taskflow_access_token', accessToken);
      localStorage.setItem('taskflow_refresh_token', refreshToken);
      localStorage.setItem('taskflow_user', JSON.stringify(user));
      localStorage.setItem('taskflow_last_active', Date.now().toString());

      return { user, accessToken, refreshToken };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Signup failed';
      return rejectWithValue(msg);
    }
  }
);

/**
 * Async Thunk: Refresh Token
 */
export const refreshUserToken = createAsyncThunk(
  'auth/refreshUserToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const refreshToken = state.auth.refreshToken || localStorage.getItem('taskflow_refresh_token');

      if (!refreshToken) {
        return rejectWithValue('No refresh token available');
      }

      const response = await api.post('/api/v1/auth/refresh', { refreshToken });
      const { accessToken, user } = response.data.data;

      localStorage.setItem('taskflow_access_token', accessToken);
      if (user) {
        localStorage.setItem('taskflow_user', JSON.stringify(user));
      }

      return { accessToken, user };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Token refresh failed';
      return rejectWithValue(msg);
    }
  }
);

/**
 * Async Thunk: Request Password Reset Code
 */
export const requestResetCode = createAsyncThunk(
  'auth/requestResetCode',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/auth/forgot-password', { email });
      return response.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to request reset code';
      return rejectWithValue(msg);
    }
  }
);

/**
 * Async Thunk: Submit New Password
 */
export const submitResetPassword = createAsyncThunk(
  'auth/submitResetPassword',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/auth/reset-password', payload);
      return response.data.message;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to reset password';
      return rejectWithValue(msg);
    }
  }
);

/**
 * Async Thunk: Fetch Current User Profile
 */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/auth/me');
      return response.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch user';
      return rejectWithValue(msg);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    accessToken: initialAccessToken,
    refreshToken: initialRefreshToken,
    isAuthenticated: Boolean(initialAccessToken && initialUser),
    loading: false,
    authError: null,
    successMessage: null,
    logoutReason: null,
    // Idle tracking: 7 minutes = 420 seconds
    idleRemainingSeconds: 420,
    idleWarningModalOpen: false,
    lastTokenRefresh: Date.now(),
    resetFlow: {
      email: '',
      codeSent: false,
      devCode: '',
    },
  },
  reducers: {
    logout: (state, action) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.authError = null;
      state.logoutReason = action.payload || null;
      state.idleWarningModalOpen = false;

      localStorage.removeItem('taskflow_access_token');
      localStorage.removeItem('taskflow_refresh_token');
      localStorage.removeItem('taskflow_user');
      localStorage.removeItem('taskflow_last_active');
    },
    clearAuthMessages: (state) => {
      state.authError = null;
      state.successMessage = null;
      state.logoutReason = null;
    },
    setIdleRemainingSeconds: (state, action) => {
      state.idleRemainingSeconds = action.payload;
    },
    setIdleWarningModal: (state, action) => {
      state.idleWarningModalOpen = action.payload;
    },
    updateLastTokenRefresh: (state) => {
      state.lastTokenRefresh = Date.now();
    },
    setResetEmail: (state, action) => {
      state.resetFlow.email = action.payload;
    },
    clearResetFlow: (state) => {
      state.resetFlow = { email: '', codeSent: false, devCode: '' };
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.authError = null;
        state.logoutReason = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.authError = null;
        state.lastTokenRefresh = Date.now();
        state.idleRemainingSeconds = 420;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.authError = action.payload;
      })

      // Signup
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.authError = null;
        state.logoutReason = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.authError = null;
        state.lastTokenRefresh = Date.now();
        state.idleRemainingSeconds = 420;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.authError = action.payload;
      })

      // Refresh Token
      .addCase(refreshUserToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        if (action.payload.user) {
          state.user = action.payload.user;
        }
        state.lastTokenRefresh = Date.now();
      })
      .addCase(refreshUserToken.rejected, (state) => {
        // If refresh fails in background, we keep state until explicit 401 or timeout
      })

      // Request Reset Code
      .addCase(requestResetCode.pending, (state) => {
        state.loading = true;
        state.authError = null;
        state.successMessage = null;
      })
      .addCase(requestResetCode.fulfilled, (state, action) => {
        state.loading = false;
        state.resetFlow.codeSent = true;
        state.resetFlow.devCode = action.payload.resetCode || '';
        state.resetFlow.email = action.payload.email;
        state.successMessage = `Reset code sent! Use code: ${action.payload.resetCode}`;
      })
      .addCase(requestResetCode.rejected, (state, action) => {
        state.loading = false;
        state.authError = action.payload;
      })

      // Submit Reset Password
      .addCase(submitResetPassword.pending, (state) => {
        state.loading = true;
        state.authError = null;
        state.successMessage = null;
      })
      .addCase(submitResetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload || 'Password changed successfully! You can now log in.';
        state.resetFlow = { email: '', codeSent: false, devCode: '' };
      })
      .addCase(submitResetPassword.rejected, (state, action) => {
        state.loading = false;
        state.authError = action.payload;
      })

      // Fetch Profile
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('taskflow_user', JSON.stringify(action.payload));
      });
  },
});

export const {
  logout,
  clearAuthMessages,
  setIdleRemainingSeconds,
  setIdleWarningModal,
  updateLastTokenRefresh,
  setResetEmail,
  clearResetFlow,
} = authSlice.actions;

export default authSlice.reducer;
