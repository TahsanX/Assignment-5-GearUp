'use client';

import { CreditCard } from 'lucide-react';
import { useMyPayments } from '@/hooks/use-rentals';
import { formatCurrency, formatDate } from '@/lib/utils';
import { errorMessage } from '@/lib/api';
import { PaymentBadge } from '@/components/ui/badge';
import { TableWrap, Td, Th } from '@/components/dashboard/data-table';
import { TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/alert';

export default function CustomerPaymentsPage() {
  const { data, isLoading, isError, error } = useMyPayments();

  if (isLoading) return <TableSkeleton rows={5} cols={5} />;
  if (isError) return <ErrorAlert message={errorMessage(error)} />;

  const payments = data ?? [];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Payment history</h2>

      {payments.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="size-10" />}
          title="No payments yet"
          description="Payments appear here once you check out a confirmed rental."
        />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Transaction</Th>
              <Th>Amount</Th>
              <Th>Method</Th>
              <Th>Status</Th>
              <Th>Date</Th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="transition-colors hover:bg-surface-muted">
                <Td>
                  <span className="font-mono text-xs break-all">{payment.transactionId}</span>
                </Td>
                <Td className="font-semibold whitespace-nowrap">
                  {formatCurrency(payment.amount)}
                </Td>
                <Td className="whitespace-nowrap">{payment.method}</Td>
                <Td>
                  <PaymentBadge status={payment.status} />
                </Td>
                <Td className="whitespace-nowrap text-muted">
                  {formatDate(payment.paidAt ?? payment.createdAt)}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
