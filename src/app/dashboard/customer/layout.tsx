'use client';

import { CreditCard, LayoutDashboard, Package } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { useAuth } from '@/providers/auth-provider';

const NAV = [
  { href: '/dashboard/customer', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/customer/orders', label: 'My Rentals', icon: Package },
  { href: '/dashboard/customer/payments', label: 'Payments', icon: CreditCard },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <DashboardShell
      title="Customer dashboard"
      subtitle={user ? `Signed in as ${user.name}` : undefined}
      nav={NAV}
    >
      {children}
    </DashboardShell>
  );
}
