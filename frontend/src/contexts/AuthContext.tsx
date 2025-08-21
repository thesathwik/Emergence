import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User, LoginCredentials, RegisterCredentials } from '../types';
import { authService } from '../services/authService';

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('authToken'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Auth context interface
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<{ verificationUrl?: string; emailSent: boolean }>;
  logout: () => void;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          dispatch({ type: 'AUTH_START' });
          await checkAuthStatus();
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          logout();
        }
      }
    };

    initializeAuth();
  }, []);

  // Check authentication status
  const checkAuthStatus = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await authService.getProfile();
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: response.user, token },
      });
    } catch (error) {
      console.error('Auth status check failed:', error);
      logout();
      throw error;
    }
  };

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authService.login(credentials);
      
      // Store token in localStorage
      localStorage.setItem('authToken', response.token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: response.user, token: response.token },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Register function
  const register = async (credentials: RegisterCredentials): Promise<{ verificationUrl?: string; emailSent: boolean }> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authService.register(credentials);
      
      // Store token in localStorage
      localStorage.setItem('authToken', response.token);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: response.user, token: response.token },
      });

      // Return verification info
      return {
        verificationUrl: response.verificationUrl,
        emailSent: response.emailSent ?? false
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Logout function
  const logout = (): void => {
    // Remove token from localStorage
    localStorage.removeItem('authToken');
    
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Context value
  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook to check if user is authenticated
export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};

// Hook to get current user
export const useCurrentUser = (): User | null => {
  const { user } = useAuth();
  return user;
};

// Hook to get auth token
export const useAuthToken = (): string | null => {
  const { token } = useAuth();
  return token;
};

export default AuthContext;
