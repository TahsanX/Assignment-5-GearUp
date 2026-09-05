'use client';

import { ClipboardList, LayoutDashboard, Package } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { useAuth } from '@/providers/auth-provider';

const NAV = [
  { href: '/dashboard/provider', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/provider/gear', label: 'My Inventory', icon: Package },
  { href: '/dashboard/provider/orders', label: 'Orders', icon: ClipboardList },
];

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <DashboardShell
      title="Provider dashboard"
      subtitle={user ? `Signed in as ${user.name}` : undefined}
      nav={NAV}
    >
      {children}
    </DashboardShell>
  );
}
