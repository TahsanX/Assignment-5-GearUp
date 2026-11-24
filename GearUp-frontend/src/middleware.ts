import { NextResponse, type NextRequest } from 'next/server';
import { ROLE_COOKIE, TOKEN_COOKIE } from '@/lib/auth';

/** Dashboard sections and the single role allowed to enter each. */
const ROLE_GATES: { prefix: string; role: string }[] = [
  { prefix: '/dashboard/admin', role: 'ADMIN' },
  { prefix: '/dashboard/provider', role: 'PROVIDER' },
  { prefix: '/dashboard/customer', role: 'CUSTOMER' },
];

const HOME_BY_ROLE: Record<string, string> = {
  ADMIN: '/dashboard/admin',
  PROVIDER: '/dashboard/provider',
  CUSTOMER: '/dashboard/customer',
};

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get(TOKEN_COOKIE)?.value;
  const role = req.cookies.get(ROLE_COOKIE)?.value;

  // Signed-in users have no reason to see the auth screens.
  if (pathname.startsWith('/auth') && token && role) {
    return NextResponse.redirect(new URL(HOME_BY_ROLE[role] ?? '/', req.url));
  }

  if (!pathname.startsWith('/dashboard')) return NextResponse.next();

  if (!token || !role) {
    const login = new URL('/auth/login', req.url);
    login.searchParams.set('redirect', pathname + search);
    return NextResponse.redirect(login);
  }

  // `/dashboard` itself just forwards to the right role's home.
  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL(HOME_BY_ROLE[role] ?? '/', req.url));
  }

  const gate = ROLE_GATES.find((g) => pathname.startsWith(g.prefix));
  if (gate && gate.role !== role) {
    return NextResponse.redirect(new URL('/forbidden', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};
