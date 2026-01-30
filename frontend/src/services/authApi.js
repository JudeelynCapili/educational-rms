import api from './api';

/**
 * User authentication API service
 */
export const authApi = {
  // Register a new user
  register: async (userData) => {
    const response = await api.post('/auth/users/register/', userData);
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/users/login/', {
      email,
      password,
    });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/users/logout/');
    return response.data;
  },

  // Get current user details
  getCurrentUser: async () => {
    const response = await api.get('/auth/users/me/');
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/users/refresh_token/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  // Change password
  changePassword: async (oldPassword, newPassword, newPasswordConfirm) => {
    const response = await api.post('/auth/users/change_password/', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });
    return response.data;
  },

  // Get available roles
  getRoles: async () => {
    const response = await api.get('/auth/users/roles/');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profiles/me/', profileData);
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/profiles/me/');
    return response.data;
  },
};

export default authApi;
