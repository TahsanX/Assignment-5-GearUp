'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PackageSearch } from 'lucide-react';
import type { RentalStatus } from '@/lib/types';
import { useMyRentals } from '@/hooks/use-rentals';
import { formatCurrency, formatDate, rentalDays, statusLabel } from '@/lib/utils';
import { errorMessage } from '@/lib/api';
import { StatusBadge } from '@/components/ui/badge';
import { TableWrap, Td, Th } from '@/components/dashboard/data-table';
import { TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/alert';
import { LinkButton } from '@/components/ui/button';
import { Select } from '@/components/ui/field';

const STATUSES: RentalStatus[] = [
  'PLACED',
  'CONFIRMED',
  'PAID',
  'PICKED_UP',
  'RETURNED',
  'CANCELLED',
];

export default function CustomerOrdersPage() {
  const { data, isLoading, isError, error } = useMyRentals();
  const [filter, setFilter] = useState<string>('');

  if (isLoading) return <TableSkeleton rows={6} cols={5} />;
  if (isError) return <ErrorAlert message={errorMessage(error)} />;

  const orders = (data ?? []).filter((o) => !filter || o.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">My rentals</h2>
        <div className="w-48">
          <Select
            label="Status"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<PackageSearch className="size-10" />}
          title={filter ? 'No rentals with that status' : 'No rentals yet'}
          description={
            filter
              ? 'Try selecting a different status.'
              : 'Browse the catalogue and book your first piece of gear.'
          }
          action={!filter && <LinkButton href="/gear">Browse gear</LinkButton>}
        />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Gear</Th>
              <Th>Dates</Th>
              <Th>Total</Th>
              <Th>Status</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="transition-colors hover:bg-surface-muted">
                <Td>
                  <p className="font-medium">
                    {order.items?.[0]?.gearItem?.name ?? 'Rental order'}
                  </p>
                  {(order.items?.length ?? 0) > 1 && (
                    <p className="text-xs text-muted">
                      +{(order.items?.length ?? 1) - 1} more item
                    </p>
                  )}
                </Td>
                <Td className="whitespace-nowrap">
                  <p>{formatDate(order.startDate)}</p>
                  <p className="text-xs text-muted">
                    {rentalDays(order.startDate, order.endDate)} day(s)
                  </p>
                </Td>
                <Td className="font-semibold whitespace-nowrap">
                  {formatCurrency(order.totalAmount)}
                </Td>
                <Td>
                  <StatusBadge status={order.status} />
                </Td>
                <Td className="text-right whitespace-nowrap">
                  {order.status === 'CONFIRMED' ? (
                    <LinkButton
                      href={`/dashboard/customer/orders/${order.id}/pay`}
                      size="sm"
                    >
                      Pay now
                    </LinkButton>
                  ) : (
                    <Link
                      href={`/dashboard/customer/orders/${order.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      View
                    </Link>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
