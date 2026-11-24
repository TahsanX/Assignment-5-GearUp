'use client';

import Link from 'next/link';
import { Clock, DollarSign, Package, Plus, ClipboardList } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { useProviderGear, useProviderOrders } from '@/hooks/use-provider';
import { formatCurrency, formatDate } from '@/lib/utils';
import { errorMessage } from '@/lib/api';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { StatsSkeleton, TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/alert';
import { LinkButton } from '@/components/ui/button';

export default function ProviderOverviewPage() {
  const { user } = useAuth();
  const gear = useProviderGear(user?.id);
  const orders = useProviderOrders();

  if (gear.isLoading || orders.isLoading) {
    return (
      <div className="space-y-6">
        <StatsSkeleton />
        <TableSkeleton />
      </div>
    );
  }

  if (orders.isError) return <ErrorAlert message={errorMessage(orders.error)} />;

  const gearList = gear.data ?? [];
  const orderList = orders.data ?? [];
  const pending = orderList.filter((o) => o.status === 'PLACED');
  const active = orderList.filter((o) => ['PAID', 'PICKED_UP'].includes(o.status));
  const revenue = orderList
    .filter((o) => ['PAID', 'PICKED_UP', 'RETURNED'].includes(o.status))
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Gear listed" value={gearList.length} icon={Package} />
        <StatCard label="Pending orders" value={pending.length} icon={Clock} />
        <StatCard label="Active rentals" value={active.length} icon={ClipboardList} />
        <StatCard
          label="Revenue"
          value={formatCurrency(revenue)}
          icon={DollarSign}
          hint="Paid orders"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Pending orders</CardTitle>
          <Link
            href="/dashboard/provider/orders"
            className="text-sm font-medium text-primary hover:underline"
          >
            Manage all
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          {pending.length === 0 ? (
            <EmptyState
              className="border-0"
              icon={<ClipboardList className="size-10" />}
              title="No orders waiting"
              description="New rental requests will show up here for confirmation."
            />
          ) : (
            <ul className="divide-y divide-border">
              {pending.slice(0, 5).map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {order.items?.[0]?.gearItem?.name ?? 'Rental order'}
                    </p>
                    <p className="text-xs text-muted">
                      {order.customer?.name ?? 'Customer'} ·{' '}
                      {formatDate(order.startDate)} → {formatDate(order.endDate)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-semibold text-foreground">
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

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Your inventory</CardTitle>
          <LinkButton href="/dashboard/provider/gear/new" size="sm">
            <Plus className="size-4" aria-hidden />
            Add gear
          </LinkButton>
        </CardHeader>
        <CardBody className="p-0">
          {gearList.length === 0 ? (
            <EmptyState
              className="border-0"
              icon={<Package className="size-10" />}
              title="No gear listed yet"
              description="Add your first item so customers can start renting it."
              action={
                <LinkButton href="/dashboard/provider/gear/new">Add your first gear</LinkButton>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {gearList.slice(0, 5).map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted">
                      {item.category?.name} · {item.stock} in stock
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold text-foreground">
                    {formatCurrency(item.pricePerDay)}/day
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
