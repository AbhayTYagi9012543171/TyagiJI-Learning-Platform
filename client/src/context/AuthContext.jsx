
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const initialLoadStarted = useRef(false);

  /**
   * Restore the current session.
   *
   * A signed-out visitor receives:
   * {
   *   authenticated: false,
   *   user: null
   * }
   */
  const refresh = useCallback(async () => {
    try {
      const response = await api('/auth/me');

      setUser(response?.user ?? null);
      setAuthError('');

      return response?.user ?? null;
    } catch (error) {
      setUser(null);

      if (error.status !== 401) {
        setAuthError(
          error.message || 'Unable to restore your session.'
        );
      } else {
        setAuthError('');
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Restore session when the application starts.
   * Prevent duplicate requests during React StrictMode effect replay.
   */
  useEffect(() => {
    if (initialLoadStarted.current) {
      return;
    }

    initialLoadStarted.current = true;

    refresh().catch(() => {
      // The visitor remains signed out.
      // Public pages should continue working normally.
    });
  }, [refresh]);

  /**
   * Login.
   */
  const login = useCallback(async (credentials) => {
    setAuthError('');

    const response = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    setUser(response.user);
    setLoading(false);

    return response.user;
  }, []);

  /**
   * Register.
   */
  const register = useCallback(async (details) => {
    setAuthError('');

    const response = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(details),
    });

    setUser(response.user);
    setLoading(false);

    return response.user;
  }, []);

  /**
   * Logout.
   */
  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', {
        method: 'POST',
      });
    } finally {
      setUser(null);
      setAuthError('');
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    authError,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    refresh,
  }), [
    user,
    loading,
    authError,
    login,
    register,
    logout,
    refresh,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside an AuthProvider.'
    );
  }

  return context;
}
