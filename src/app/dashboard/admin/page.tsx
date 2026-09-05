'use client';

import Link from 'next/link';
import { DollarSign, Package, ClipboardList, UserCheck, Users } from 'lucide-react';
import { useAdminGear, useAdminRentals, useAdminUsers } from '@/hooks/use-admin';
import { formatCurrency, formatDate } from '@/lib/utils';
import { errorMessage } from '@/lib/api';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { StatsSkeleton, TableSkeleton } from '@/components/ui/skeleton';
import { ErrorAlert } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { CategoryManager } from './category-manager';

export default function AdminOverviewPage() {
  const users = useAdminUsers();
  const gear = useAdminGear();
  const rentals = useAdminRentals();

  if (users.isLoading || gear.isLoading || rentals.isLoading) {
    return (
      <div className="space-y-6">
        <StatsSkeleton />
        <TableSkeleton />
      </div>
    );
  }

  const firstError = users.error ?? gear.error ?? rentals.error;
  if (firstError) return <ErrorAlert message={errorMessage(firstError)} />;

  const userList = users.data ?? [];
  const gearList = gear.data ?? [];
  const rentalList = rentals.data ?? [];

  const activeUsers = userList.filter((u) => u.status === 'ACTIVE');
  const activeGear = gearList.filter((g) => g.isAvailable);
  const revenue = rentalList
    .filter((r) => ['PAID', 'PICKED_UP', 'RETURNED'].includes(r.status))
    .reduce((sum, r) => sum + Number(r.totalAmount), 0);

  const recent = rentalList.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total users"
          value={userList.length}
          icon={Users}
          hint={`${activeUsers.length} active`}
        />
        <StatCard
          label="Active gear"
          value={activeGear.length}
          icon={Package}
          hint={`${gearList.length} listed`}
        />
        <StatCard label="Total rentals" value={rentalList.length} icon={ClipboardList} />
        <StatCard
          label="Platform revenue"
          value={formatCurrency(revenue)}
          icon={DollarSign}
          hint="Paid orders"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Recent rentals</CardTitle>
              <Link
                href="/dashboard/admin/rentals"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </CardHeader>
            <CardBody className="p-0">
              {recent.length === 0 ? (
                <EmptyState
                  className="border-0"
                  icon={<ClipboardList className="size-10" />}
                  title="No rentals yet"
                />
              ) : (
                <ul className="divide-y divide-border">
                  {recent.map((order) => (
                    <li
                      key={order.id}
                      className="flex items-center justify-between gap-4 px-5 py-3.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {order.customer?.name ?? 'Customer'}
                        </p>
                        <p className="text-xs text-muted">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="font-medium text-foreground">
                          {formatCurrency(order.totalAmount)}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Users by role</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {(['CUSTOMER', 'PROVIDER', 'ADMIN'] as const).map((role) => {
                const count = userList.filter((u) => u.role === role).length;
                const pct = userList.length ? (count / userList.length) * 100 : 0;
                return (
                  <div key={role}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted capitalize">{role.toLowerCase()}</span>
                      <span className="font-medium text-foreground">{count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <p className="flex items-center gap-1.5 pt-1 text-xs text-muted">
                <UserCheck className="size-3.5" aria-hidden />
                {activeUsers.length} of {userList.length} accounts active
              </p>
            </CardBody>
          </Card>

          <CategoryManager />
        </div>
      </div>
    </div>
  );
}
