'use client';

import { use } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useRental } from '@/hooks/use-rentals';
import { formatCurrency, formatDate, rentalDays } from '@/lib/utils';
import { errorMessage } from '@/lib/api';
import { StatusBadge, PaymentBadge } from '@/components/ui/badge';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorAlert } from '@/components/ui/alert';
import { LinkButton } from '@/components/ui/button';
import { ReviewSection } from './review-section';

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: order, isLoading, isError, error } = useRental(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !order) {
    return <ErrorAlert message={errorMessage(error) || 'Rental order not found.'} />;
  }

  const days = rentalDays(order.startDate, order.endDate);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/customer/orders"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Back to my rentals
      </Link>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Rental order</CardTitle>
            <p className="mt-0.5 font-mono text-xs break-all text-muted">{order.id}</p>
          </div>
          <StatusBadge status={order.status} />
        </CardHeader>

        <CardBody className="space-y-5">
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted">Start date</dt>
              <dd className="font-medium text-foreground">{formatDate(order.startDate)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">End date</dt>
              <dd className="font-medium text-foreground">{formatDate(order.endDate)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Duration</dt>
              <dd className="font-medium text-foreground">
                {days} day{days === 1 ? '' : 's'}
              </dd>
            </div>
          </dl>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">Items</h3>
            <ul className="divide-y divide-border rounded-lg border border-border">
              {order.items?.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {item.gearItem?.name ?? 'Gear item'}
                    </p>
                    <p className="text-xs text-muted">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <span className="shrink-0 font-medium text-foreground">
                    {formatCurrency(Number(item.price) * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-xl font-bold text-foreground">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>

          {order.status === 'CONFIRMED' && (
            <LinkButton
              href={`/dashboard/customer/orders/${order.id}/pay`}
              size="lg"
              className="w-full"
            >
              Pay now
            </LinkButton>
          )}
        </CardBody>
      </Card>

      {!!order.payments?.length && (
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            <ul className="divide-y divide-border">
              {order.payments.map((payment) => (
                <li
                  key={payment.id}
                  className="flex items-center justify-between gap-4 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-xs break-all text-muted">
                      {payment.transactionId}
                    </p>
                    <p className="text-xs text-muted">
                      {formatDate(payment.paidAt ?? payment.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-medium text-foreground">
                      {formatCurrency(payment.amount)}
                    </span>
                    <PaymentBadge status={payment.status} />
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      <ReviewSection order={order} />
    </div>
  );
}
