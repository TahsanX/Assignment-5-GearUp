'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ClipboardList } from 'lucide-react';
import type { RentalOrder, RentalStatus } from '@/lib/types';
import {
  useProviderOrders,
  useUpdateOrderStatus,
  type ProviderOrderStatus,
} from '@/hooks/use-provider';
import { errorMessage } from '@/lib/api';
import { formatCurrency, formatDate, statusLabel } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/field';
import { TableWrap, Td, Th } from '@/components/dashboard/data-table';
import { TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/alert';

const STATUSES: RentalStatus[] = [
  'PLACED',
  'CONFIRMED',
  'PAID',
  'PICKED_UP',
  'RETURNED',
  'CANCELLED',
];

/**
 * The single action a provider can take from each status. Payment happens
 * between CONFIRMED and PAID, so the provider waits on the customer there.
 */
function nextAction(
  status: RentalStatus,
): { label: string; status: ProviderOrderStatus } | null {
  switch (status) {
    case 'PLACED':
      return { label: 'Confirm', status: 'CONFIRMED' };
    case 'PAID':
      return { label: 'Mark picked up', status: 'PICKED_UP' };
    case 'PICKED_UP':
      return { label: 'Mark returned', status: 'RETURNED' };
    default:
      return null;
  }
}

export default function ProviderOrdersPage() {
  const { data, isLoading, isError, error } = useProviderOrders();
  const updateStatus = useUpdateOrderStatus();
  const [filter, setFilter] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  if (isLoading) return <TableSkeleton rows={6} cols={6} />;
  if (isError) return <ErrorAlert message={errorMessage(error)} />;

  const orders = (data ?? []).filter((o) => !filter || o.status === filter);

  async function apply(order: RentalOrder, status: ProviderOrderStatus, label: string) {
    setBusyId(order.id);
    try {
      await updateStatus.mutateAsync({ id: order.id, status });
      toast.success(`Order updated`, { description: `Marked as ${statusLabel(status)}.` });
    } catch (err) {
      toast.error(`Could not ${label.toLowerCase()}`, { description: errorMessage(err) });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">
          Incoming orders{' '}
          <span className="text-sm font-normal text-muted">({orders.length})</span>
        </h2>
        <div className="w-48">
          <Select label="Status" value={filter} onChange={(e) => setFilter(e.target.value)}>
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
          icon={<ClipboardList className="size-10" />}
          title={filter ? 'No orders with that status' : 'No orders yet'}
          description={
            filter
              ? 'Try selecting a different status.'
              : 'Rental requests for your gear will appear here.'
          }
        />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Customer</Th>
              <Th>Gear</Th>
              <Th>Dates</Th>
              <Th>Total</Th>
              <Th>Status</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const action = nextAction(order.status);
              const busy = busyId === order.id;
              return (
                <tr key={order.id} className="transition-colors hover:bg-surface-muted">
                  <Td>
                    <p className="font-medium">{order.customer?.name ?? 'Customer'}</p>
                    {order.customer?.email && (
                      <p className="text-xs break-all text-muted">{order.customer.email}</p>
                    )}
                  </Td>
                  <Td>
                    <p className="font-medium">
                      {order.items?.[0]?.gearItem?.name ?? 'Rental order'}
                    </p>
                    {(order.items?.length ?? 0) > 1 && (
                      <p className="text-xs text-muted">
                        +{(order.items?.length ?? 1) - 1} more
                      </p>
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
                  <Td>
                    <div className="flex justify-end gap-2">
                      {action ? (
                        <Button
                          size="sm"
                          loading={busy}
                          onClick={() => apply(order, action.status, action.label)}
                        >
                          {action.label}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted">
                          {order.status === 'CONFIRMED'
                            ? 'Awaiting payment'
                            : 'No action needed'}
                        </span>
                      )}
                      {['PLACED', 'CONFIRMED'].includes(order.status) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busy}
                          onClick={() => apply(order, 'CANCELLED', 'Cancel')}
                          className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
