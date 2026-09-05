'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, LogOut, Menu, Moon, Mountain, Sun, X } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { useTheme } from '@/providers/theme-provider';
import { dashboardPath } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Button, LinkButton } from '@/components/ui/button';

const PUBLIC_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/gear', label: 'Browse Gear' },
];

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [...PUBLIC_LINKS];
  if (user) links.push({ href: dashboardPath(user.role), label: 'Dashboard' });

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
          <Mountain className="size-6 text-primary" aria-hidden />
          <span className="text-lg tracking-tight">GearUp</span>
        </Link>

        <div className="ml-4 hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-surface-muted text-foreground'
                  : 'text-muted hover:text-foreground',
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>

          {loading ? (
            <div className="skeleton h-9 w-24 rounded-lg" />
          ) : user ? (
            <div className="hidden items-center gap-3 md:flex">
              <div className="text-right leading-tight">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted capitalize">{user.role.toLowerCase()}</p>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="size-4" aria-hidden />
                Logout
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <LinkButton href="/auth/login" variant="ghost" size="sm">
                Login
              </LinkButton>
              <LinkButton href="/auth/register" size="sm">
                Get started
              </LinkButton>
            </div>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="rounded-lg p-2 text-muted hover:bg-surface-muted md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-border bg-surface px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 border-t border-border pt-3">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted capitalize">{user.role.toLowerCase()}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setOpen(false); logout(); }}>
                  <LogOut className="size-4" aria-hidden />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <LinkButton href="/auth/login" variant="outline" size="sm" className="flex-1" onClick={() => setOpen(false)}>
                  Login
                </LinkButton>
                <LinkButton href="/auth/register" size="sm" className="flex-1" onClick={() => setOpen(false)}>
                  Get started
                </LinkButton>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export { LayoutDashboard };
