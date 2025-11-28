import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  User,
  login as authLogin,
  logout as authLogout,
  loginWithGoogle as authLoginWithGoogle,
  loginWithMicrosoft as authLoginWithMicrosoft,
  fetchCurrentUser,
  getToken,
  getStoredUser,
  handleOAuthCallback,
  isAuthenticated as checkIsAuthenticated,
} from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>;
  loginWithGoogle: (remember?: boolean) => void;
  loginWithMicrosoft: (remember?: boolean) => void;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      // Check for OAuth callback first
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('token') || urlParams.has('error')) {
        const oauthResult = handleOAuthCallback();
        if (oauthResult.success) {
          setToken(oauthResult.token || null);
          const userData = await fetchCurrentUser();
          if (userData) {
            setUser(userData);
          }
        } else if (oauthResult.error) {
          setError(oauthResult.error);
        }
        setIsLoading(false);
        return;
      }

      // Check for existing token
      const storedToken = getToken();
      if (storedToken) {
        setToken(storedToken);

        // Try to get stored user first for faster initial render
        const storedUser = getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }

        // Validate token by fetching fresh user data
        const userData = await fetchCurrentUser();
        if (userData) {
          setUser(userData);
        } else {
          // Token invalid, clear everything
          authLogout();
          setToken(null);
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string, remember: boolean = false): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    const result = await authLogin(email, password, remember);

    if (result.success) {
      setToken(getToken());
      setUser(result.user || null);
      setIsLoading(false);
      return true;
    } else {
      setError(result.error || 'Login failed');
      setIsLoading(false);
      return false;
    }
  }, []);

  const loginWithGoogle = useCallback((remember: boolean = false) => {
    authLoginWithGoogle(remember);
  }, []);

  const loginWithMicrosoft = useCallback((remember: boolean = false) => {
    authLoginWithMicrosoft(remember);
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
    setToken(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: checkIsAuthenticated(),
    isLoading,
    error,
    login,
    loginWithGoogle,
    loginWithMicrosoft,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
