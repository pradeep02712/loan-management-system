'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearToken, setToken } from './api';
import type { Role, User } from './types';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (fullName: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ user: User }>('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(email, password) {
        const data = await api<{ token: string; user: User }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        setToken(data.token);
        setUser(data.user);
        return data.user;
      },
      async register(fullName, email, password) {
        const data = await api<{ token: string; user: User }>('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ fullName, email, password })
        });
        setToken(data.token);
        setUser(data.user);
        return data.user;
      },
      logout() {
        clearToken();
        setUser(null);
      },
      hasRole(...roles) {
        return Boolean(user && roles.includes(user.role));
      }
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
