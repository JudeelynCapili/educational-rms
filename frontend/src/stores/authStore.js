import { create } from 'zustand';
import { authApi } from '../services/authApi';

export const useAuthStore = create((set) => ({
  user: null,
  tokens: {
    access: null,
    refresh: null,
  },
  isLoading: false,
  error: null,
  isAuthenticated: false,
  lastActivityTime: Date.now(), // Track last activity time

  // Initialize auth from localStorage
  initAuth: async () => {
    const access = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');

    if (access && refresh) {
      set({
        tokens: { access, refresh },
        isAuthenticated: true,
      });

      try {
        const user = await authApi.getCurrentUser();
        set({ user });
      } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({
          tokens: { access: null, refresh: null },
          isAuthenticated: false,
          user: null,
        });
      }
    }
  },

  // Register new user
  register: async (userData) => {
    set({ isLoading: true, error: null });
    console.log('Registering with data:', userData);
    try {
      const data = await authApi.register(userData);
      console.log('Registration response:', data);
      localStorage.setItem('access_token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);

      set({
        user: data.user,
        tokens: {
          access: data.tokens.access,
          refresh: data.tokens.refresh,
        },
        isAuthenticated: true,
        isLoading: false,
      });

      return data;
    } catch (error) {
      let errorMessage = 'Registration failed';
      
      // Try different error response formats
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.non_field_errors?.[0]) {
        errorMessage = error.response.data.non_field_errors[0];
      } else if (error.response?.data?.username) {
        errorMessage = Array.isArray(error.response.data.username) 
          ? error.response.data.username[0] 
          : error.response.data.username;
      } else if (error.response?.data?.email) {
        errorMessage = Array.isArray(error.response.data.email) 
          ? error.response.data.email[0] 
          : error.response.data.email;
      } else if (error.response?.data?.password) {
        errorMessage = Array.isArray(error.response.data.password) 
          ? error.response.data.password[0] 
          : error.response.data.password;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Login user
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem('access_token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);

      set({
        user: data.user,
        tokens: {
          access: data.tokens.access,
          refresh: data.tokens.refresh,
        },
        isAuthenticated: true,
        isLoading: false,
      });

      return data;
    } catch (error) {
      let errorMessage = 'Login failed';
      
      // Try different error response formats
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.non_field_errors?.[0]) {
        errorMessage = error.response.data.non_field_errors[0];
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authApi.logout();
    } catch (err) {
      // Ignore errors during logout
    }

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    set({
      user: null,
      tokens: { access: null, refresh: null },
      isAuthenticated: false,
      isLoading: false,
    });
  },

  // Change password
  changePassword: async (oldPassword, newPassword, newPasswordConfirm) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.changePassword(oldPassword, newPassword, newPasswordConfirm);
      set({ isLoading: false });
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Password change failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
