import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getProfile, loginWithGoogle, loginWithOutlook, logout as logoutService } from '../services/authService';

const AuthContext = createContext(null);

const tokenKey = 'luma_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(user);

  const setSession = (session) => {
    if (session?.token) {
      window.localStorage.setItem(tokenKey, session.token);
    }
    setUser(session?.user ?? null);
  };

  const clearSession = () => {
    window.localStorage.removeItem(tokenKey);
    setUser(null);
  };

  const syncProfile = async () => {
    const token = window.localStorage.getItem(tokenKey);
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const profile = await getProfile();
      setUser(profile?.user ?? profile ?? null);
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncProfile();

    const handleUnauthorized = () => clearSession();
    window.addEventListener('luma:unauthorized', handleUnauthorized);

    return () => window.removeEventListener('luma:unauthorized', handleUnauthorized);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
      setSession,
      clearSession,
      loginWithGoogle: async () => {
        const session = await loginWithGoogle();
        setSession(session);
        return session;
      },
      loginWithOutlook: async () => {
        const session = await loginWithOutlook();
        setSession(session);
        return session;
      },
      logout: async () => {
        try {
          await logoutService();
        } finally {
          clearSession();
        }
      },
    }),
    [user, isAuthenticated, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}