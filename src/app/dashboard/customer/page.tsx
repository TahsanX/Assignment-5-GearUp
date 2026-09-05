'use client';

import Link from 'next/link';
import { CheckCircle2, Clock, CreditCard, Package, PackageSearch } from 'lucide-react';
import { useMyPayments, useMyRentals } from '@/hooks/use-rentals';
import { formatCurrency, formatDate } from '@/lib/utils';
import { errorMessage } from '@/lib/api';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { StatsSkeleton, TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/alert';
import { LinkButton } from '@/components/ui/button';

export default function CustomerOverviewPage() {
  const rentals = useMyRentals();
  const payments = useMyPayments();

  if (rentals.isLoading) {
    return (
      <div className="space-y-6">
        <StatsSkeleton />
        <TableSkeleton />
      </div>
    );
  }

  if (rentals.isError) {
    return <ErrorAlert message={errorMessage(rentals.error)} />;
  }

  const orders = rentals.data ?? [];
  const active = orders.filter((o) =>
    ['PLACED', 'CONFIRMED', 'PAID', 'PICKED_UP'].includes(o.status),
  );
  const completed = orders.filter((o) => o.status === 'RETURNED');
  const totalSpent = (payments.data ?? [])
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const recent = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total rentals" value={orders.length} icon={Package} />
        <StatCard label="Active" value={active.length} icon={Clock} />
        <StatCard label="Completed" value={completed.length} icon={CheckCircle2} />
        <StatCard
          label="Total spent"
          value={formatCurrency(totalSpent)}
          icon={CreditCard}
          hint="Completed payments"
        />
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Recent rentals</CardTitle>
          <Link
            href="/dashboard/customer/orders"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          {recent.length === 0 ? (
            <EmptyState
              className="border-0"
              icon={<PackageSearch className="size-10" />}
              title="No rentals yet"
              description="Browse the catalogue and book your first piece of gear."
              action={<LinkButton href="/gear">Browse gear</LinkButton>}
            />
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/dashboard/customer/orders/${order.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface-muted"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {order.items?.[0]?.gearItem?.name ?? 'Rental order'}
                        {(order.items?.length ?? 0) > 1 &&
                          ` +${(order.items?.length ?? 1) - 1} more`}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {formatDate(order.startDate)} → {formatDate(order.endDate)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <span className="font-semibold text-foreground">
                        {formatCurrency(order.totalAmount)}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
