import type { Role, User } from './types';

export const TOKEN_COOKIE = 'gearup_token';
export const ROLE_COOKIE = 'gearup_role';
const USER_KEY = 'gearup_user';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // mirrors the backend's 7d JWT

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export function getToken(): string | null {
  return readCookie(TOKEN_COOKIE);
}

/**
 * Persist the session. The token also lives in a cookie so Next.js middleware
 * can gate dashboard routes before the client bundle runs.
 */
export function persistSession(user: User, token: string) {
  setCookie(TOKEN_COOKIE, token);
  setCookie(ROLE_COOKIE, user.role);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  deleteCookie(TOKEN_COOKIE);
  deleteCookie(ROLE_COOKIE);
  localStorage.removeItem(USER_KEY);
}

export function readStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

/** Landing route for each role after login. */
export function dashboardPath(role: Role): string {
  switch (role) {
    case 'ADMIN':
      return '/dashboard/admin';
    case 'PROVIDER':
      return '/dashboard/provider';
    default:
      return '/dashboard/customer';
  }
}
