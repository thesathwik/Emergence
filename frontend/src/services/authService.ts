import axios, { AxiosError, AxiosResponse } from 'axios';
import { 
  LoginCredentials, 
  RegisterCredentials, 
  AuthResponse, 
  AuthError, 
  User 
} from '../types';
import { getErrorMessage, logError } from '../utils/errorHandling';

// Create axios instance with base configuration
const isProduction = process.env.NODE_ENV === 'production' || 
                     window.location.hostname.includes('railway.app') ||
                     window.location.hostname.includes('up.railway.app');

const baseURL = isProduction 
  ? '/api/auth'  // Use relative path in production (same domain)
  : 'http://localhost:3001/api/auth';  // Use localhost in development

const authApi = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
authApi.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Log error with context
    logError(error, 'Auth API Request');
    
    // Handle token expiration
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('authToken');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Enhance error with user-friendly message
    (error as any).userMessage = getErrorMessage(error);
    
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data as AuthError;
      console.error('Auth API Error:', {
        status: error.response.status,
        message: errorData?.message || error.message,
        errors: errorData?.errors || []
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('Auth Network Error:', 'No response received from server');
    } else {
      // Something else happened
      console.error('Auth Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Authentication service
export const authService = {
  /**
   * Register a new user
   * @param credentials - User registration data
   * @returns Promise with auth response
   */
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const response = await authApi.post<AuthResponse>('/register', credentials);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle validation errors
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as AuthError;
        if (errorData.errors && errorData.errors.length > 0) {
          const errorMessage = errorData.errors.map(err => `${err.field}: ${err.message}`).join(', ');
          throw new Error(errorMessage);
        }
        throw new Error(errorData.message || 'Registration failed');
      }
      
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    }
  },

  /**
   * Login user
   * @param credentials - User login credentials
   * @returns Promise with auth response
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await authApi.post<AuthResponse>('/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle validation errors
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as AuthError;
        if (errorData.errors && errorData.errors.length > 0) {
          const errorMessage = errorData.errors.map(err => `${err.field}: ${err.message}`).join(', ');
          throw new Error(errorMessage);
        }
        throw new Error(errorData.message || 'Login failed');
      }
      
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  },

  /**
   * Get current user profile
   * @returns Promise with user profile
   */
  getProfile: async (): Promise<{ success: boolean; user: User }> => {
    try {
      const response = await authApi.get<{ success: boolean; user: User }>('/me');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get profile');
    }
  },

  /**
   * Logout user
   * @returns Promise with logout confirmation
   */
  logout: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authApi.post<{ success: boolean; message: string }>('/logout');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw error for logout, just return success
      return { success: true, message: 'Logged out successfully' };
    }
  },

  /**
   * Check if token is valid
   * @returns Promise with token validity
   */
  validateToken: async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return false;
      }

      await authApi.get('/me');
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  /**
   * Refresh authentication token
   * @returns Promise with new token
   */
  refreshToken: async (): Promise<string> => {
    try {
      const response = await authApi.post<{ success: boolean; token: string }>('/refresh');
      return response.data.token;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to refresh token');
    }
  },

  /**
   * Change user password
   * @param currentPassword - Current password
   * @param newPassword - New password
   * @returns Promise with success confirmation
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authApi.post<{ success: boolean; message: string }>('/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as AuthError;
        throw new Error(errorData.message || 'Failed to change password');
      }
      
      throw new Error(error instanceof Error ? error.message : 'Failed to change password');
    }
  },

  /**
   * Update user profile
   * @param profileData - Updated profile data
   * @returns Promise with updated user
   */
  updateProfile: async (profileData: Partial<User>): Promise<{ success: boolean; user: User }> => {
    try {
      const response = await authApi.put<{ success: boolean; user: User }>('/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as AuthError;
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      throw new Error(error instanceof Error ? error.message : 'Failed to update profile');
    }
  },

  /**
   * Delete user account
   * @param password - User password for confirmation
   * @returns Promise with deletion confirmation
   */
  deleteAccount: async (password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authApi.delete<{ success: boolean; message: string }>('/account', {
        data: { password }
      });
      return response.data;
    } catch (error) {
      console.error('Delete account error:', error);
      
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as AuthError;
        throw new Error(errorData.message || 'Failed to delete account');
      }
      
      throw new Error(error instanceof Error ? error.message : 'Failed to delete account');
    }
  },

  /**
   * Resend verification email
   * @param email - User email address
   * @returns Promise with success confirmation
   */
  resendVerification: async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authApi.post<{ success: boolean; message: string }>('/resend-verification', {
        email
      });
      return response.data;
    } catch (error) {
      console.error('Resend verification error:', error);
      
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as AuthError;
        throw new Error(errorData.message || 'Failed to resend verification email');
      }
      
      throw new Error(error instanceof Error ? error.message : 'Failed to resend verification email');
    }
  }
};

// Utility functions
export const authUtils = {
  /**
   * Get stored auth token
   * @returns Stored token or null
   */
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  /**
   * Set auth token in localStorage
   * @param token - JWT token
   */
  setToken: (token: string): void => {
    localStorage.setItem('authToken', token);
  },

  /**
   * Remove auth token from localStorage
   */
  removeToken: (): void => {
    localStorage.removeItem('authToken');
  },

  /**
   * Check if user is authenticated
   * @returns True if token exists
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },

  /**
   * Decode JWT token (without verification)
   * @param token - JWT token
   * @returns Decoded token payload or null
   */
  decodeToken: (token: string): any => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  },

  /**
   * Check if token is expired
   * @param token - JWT token
   * @returns True if token is expired
   */
  isTokenExpired: (token: string): boolean => {
    const decoded = authUtils.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  },

  /**
   * Get token expiration time
   * @param token - JWT token
   * @returns Expiration timestamp or null
   */
  getTokenExpiration: (token: string): number | null => {
    const decoded = authUtils.decodeToken(token);
    return decoded?.exp || null;
  }
};

export default authService;
