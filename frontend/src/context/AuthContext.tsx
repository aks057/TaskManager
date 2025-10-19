import React, { createContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { authService } from '../services/authService';
import { handleApiError } from '../services/api';
import {
  User,
  LoginCredentials,
  RegisterData,
  AuthState,
  AuthContextType,
} from '../types/auth.types';

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; accessToken: string; refreshToken: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        loading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userStr = localStorage.getItem('user');

        if (accessToken && refreshToken && userStr) {
          // Verify token is still valid by fetching user
          try {
            const currentUser = await authService.getMe();
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user: currentUser, accessToken, refreshToken },
            });
          } catch {
            // Token invalid, clear storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            dispatch({ type: 'LOGOUT' });
          }
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        dispatch({ type: 'LOGOUT' });
      }
    };

    loadUser();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await authService.login(credentials);

      // Save to localStorage
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        },
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await authService.register(data);

      // Save to localStorage
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        },
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const logout = useCallback((): void => {
    const refreshToken = localStorage.getItem('refreshToken');

    // Call logout API (don't await, best effort)
    if (refreshToken) {
      authService.logout(refreshToken).catch(() => {});
    }

    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    dispatch({ type: 'LOGOUT' });
  }, []);

  const clearError = useCallback((): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const updateUser = useCallback((user: User): void => {
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(user));

    // Update state
    dispatch({ type: 'UPDATE_USER', payload: user });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        error: state.error,
        login,
        register,
        logout,
        clearError,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
