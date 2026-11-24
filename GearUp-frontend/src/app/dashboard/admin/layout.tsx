'use client';

import { ClipboardList, LayoutDashboard, Package, Users } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { useAuth } from '@/providers/auth-provider';

const NAV = [
  { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users },
  { href: '/dashboard/admin/gear', label: 'Gear', icon: Package },
  { href: '/dashboard/admin/rentals', label: 'Rentals', icon: ClipboardList },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <DashboardShell
      title="Admin dashboard"
      subtitle={user ? `Signed in as ${user.name}` : undefined}
      nav={NAV}
    >
      {children}
    </DashboardShell>
  );
}
