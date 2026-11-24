'use client';

import { useMemo, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import type { RentalStatus } from '@/lib/types';
import { useAdminRentals } from '@/hooks/use-admin';
import { errorMessage } from '@/lib/api';
import { formatCurrency, formatDate, statusLabel } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/badge';
import { Select } from '@/components/ui/field';
import { TableWrap, Td, Th } from '@/components/dashboard/data-table';
import { Pagination } from '@/components/dashboard/pagination';
import { TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/alert';

const PAGE_SIZE = 10;

const STATUSES: RentalStatus[] = [
  'PLACED',
  'CONFIRMED',
  'PAID',
  'PICKED_UP',
  'RETURNED',
  'CANCELLED',
];

export default function AdminRentalsPage() {
  const { data, isLoading, isError, error } = useAdminRentals();
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => (data ?? []).filter((r) => !filter || r.status === filter),
    [data, filter],
  );

  if (isLoading) return <TableSkeleton rows={8} cols={5} />;
  if (isError) return <ErrorAlert message={errorMessage(error)} />;

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">
          All rentals{' '}
          <span className="text-sm font-normal text-muted">({filtered.length})</span>
        </h2>
        <div className="w-48">
          <Select
            label="Status"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
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

      {visible.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="size-10" />}
          title={filter ? 'No rentals with that status' : 'No rentals yet'}
          description={filter ? 'Try selecting a different status.' : undefined}
        />
      ) : (
        <>
          <TableWrap>
            <thead>
              <tr>
                <Th>Customer</Th>
                <Th>Items</Th>
                <Th>Dates</Th>
                <Th>Total</Th>
                <Th>Status</Th>
                <Th>Placed</Th>
              </tr>
            </thead>
            <tbody>
              {visible.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-surface-muted">
                  <Td>
                    <p className="font-medium">{order.customer?.name ?? 'Customer'}</p>
                    {order.customer?.email && (
                      <p className="text-xs break-all text-muted">{order.customer.email}</p>
                    )}
                  </Td>
                  <Td className="text-muted">
                    {order.items?.[0]?.gearItem?.name ?? '—'}
                    {(order.items?.length ?? 0) > 1 && (
                      <span className="text-xs"> +{(order.items?.length ?? 1) - 1}</span>
                    )}
                  </Td>
                  <Td className="whitespace-nowrap text-muted">
                    <p>{formatDate(order.startDate)}</p>
                    <p className="text-xs">→ {formatDate(order.endDate)}</p>
                  </Td>
                  <Td className="font-semibold whitespace-nowrap">
                    {formatCurrency(order.totalAmount)}
                  </Td>
                  <Td>
                    <StatusBadge status={order.status} />
                  </Td>
                  <Td className="whitespace-nowrap text-muted">{formatDate(order.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>

          <Pagination
            page={safePage}
            pageCount={pageCount}
            total={filtered.length}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
