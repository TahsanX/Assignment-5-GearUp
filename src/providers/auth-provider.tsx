'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { Role, User } from '@/lib/types';
import { apiFetch } from '@/lib/api';
import {
  clearSession,
  getToken,
  persistSession,
  readStoredUser,
} from '@/lib/auth';

interface AuthContextValue {
  user: User | null;
  /** True until the stored session has been read and revalidated. */
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Hydrate from storage, then confirm the token is still valid server-side.
  // These setState calls must run after hydration: localStorage and the auth
  // cookie do not exist during SSR, so the session cannot be part of the
  // initial render. That is what this effect is for, not a cascading render.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const cached = readStoredUser();
    if (cached) setUser(cached);

    if (!getToken()) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    apiFetch<User>('/auth/me')
      .then((fresh) => {
        if (cancelled) return;
        setUser(fresh);
        const token = getToken();
        if (token) persistSession(fresh, token);
      })
      .catch(() => {
        // Expired or revoked token — drop the stale session.
        if (cancelled) return;
        clearSession();
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const login = useCallback(
    (nextUser: User, token: string) => {
      persistSession(nextUser, token);
      setUser(nextUser);
      queryClient.clear();
    },
    [queryClient],
  );

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    queryClient.clear();
    router.push('/');
    router.refresh();
  }, [queryClient, router]);

  const hasRole = useCallback(
    (...roles: Role[]) => (user ? roles.includes(user.role) : false),
    [user],
  );

  const value = useMemo(
    () => ({ user, loading, login, logout, hasRole }),
    [user, loading, login, logout, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
