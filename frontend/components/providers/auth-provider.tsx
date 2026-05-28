'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as authApi from '@/lib/api/auth';
import { toApiError, type ApiError } from '@/lib/api/client';
import {
  getStoredToken,
  removeStoredToken,
  setStoredToken,
} from '@/lib/auth-token';

type RegisterInput = {
  email: string;
  password: string;
  name?: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type AuthContextValue = {
  user: authApi.AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  register: (input: RegisterInput) => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<authApi.AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const logout = useCallback(() => {
    removeStoredToken();
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const refreshMeWithToken = useCallback(
    async (nextToken: string): Promise<void> => {
      try {
        const me = await authApi.getMe(nextToken);
        setUser(me);
      } catch (rawError) {
        const apiError: ApiError = toApiError(rawError);

        if (apiError.status === 401) {
          logout();
          return;
        }

        setError(apiError.message);
        throw apiError;
      }
    },
    [logout],
  );

  const refreshMe = useCallback(async (): Promise<void> => {
    if (!token) {
      setUser(null);
      return;
    }

    setError(null);
    await refreshMeWithToken(token);
  }, [refreshMeWithToken, token]);

  const register = useCallback(async (input: RegisterInput): Promise<void> => {
    setError(null);

    try {
      await authApi.register(input);
    } catch (rawError) {
      const apiError = toApiError(rawError);
      setError(apiError.message);
      throw apiError;
    }
  }, []);

  const login = useCallback(
    async (input: LoginInput): Promise<void> => {
      setError(null);

      try {
        const result = await authApi.login(input);
        setStoredToken(result.accessToken);
        setToken(result.accessToken);
        await refreshMeWithToken(result.accessToken);
      } catch (rawError) {
        const apiError = toApiError(rawError);
        setError(apiError.message);
        throw apiError;
      }
    },
    [refreshMeWithToken],
  );

  useEffect(() => {
    const bootstrapAuth = async () => {
      const storedToken = getStoredToken();

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);
      await refreshMeWithToken(storedToken);
      setIsLoading(false);
    };

    void bootstrapAuth().catch(() => {
      setIsLoading(false);
    });
  }, [refreshMeWithToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      error,
      register,
      login,
      logout,
      refreshMe,
      clearError,
    }),
    [user, token, isLoading, error, register, login, logout, refreshMe, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}
