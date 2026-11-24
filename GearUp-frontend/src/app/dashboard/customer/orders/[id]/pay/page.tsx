'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Lock, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useCreatePayment, useRental } from '@/hooks/use-rentals';
import { errorMessage } from '@/lib/api';
import { formatCurrency, formatDate, rentalDays } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorAlert } from '@/components/ui/alert';
import { StatusBadge } from '@/components/ui/badge';

export default function PayOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: order, isLoading, isError, error } = useRental(id);
  const createPayment = useCreatePayment();
  const [redirecting, setRedirecting] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (isError || !order) {
    return <ErrorAlert message={errorMessage(error) || 'Rental order not found.'} />;
  }

  const alreadyPaid = ['PAID', 'PICKED_UP', 'RETURNED'].includes(order.status);
  const days = rentalDays(order.startDate, order.endDate);

  async function handlePay() {
    try {
      const session = await createPayment.mutateAsync(id);
      setRedirecting(true);
      toast.success('Redirecting to secure checkout…');
      // Hand off to the SSLCommerz hosted gateway.
      window.location.href = session.paymentUrl;
    } catch (err) {
      toast.error('Could not start checkout', { description: errorMessage(err) });
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/dashboard/customer/orders/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Back to order
      </Link>

      <Card>
        <CardHeader className="flex items-center justify-between gap-3">
          <CardTitle>Checkout</CardTitle>
          <StatusBadge status={order.status} />
        </CardHeader>

        <CardBody className="space-y-5">
          {alreadyPaid ? (
            <ErrorAlert message="This order has already been paid for." />
          ) : order.status === 'CANCELLED' ? (
            <ErrorAlert message="This order was cancelled and can no longer be paid." />
          ) : (
            <>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">Order summary</h3>
                <ul className="divide-y divide-border rounded-lg border border-border">
                  {order.items?.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-4 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {item.gearItem?.name ?? 'Gear item'}
                        </p>
                        <p className="text-xs text-muted">
                          {formatCurrency(item.price)} × {item.quantity} × {days} day
                          {days === 1 ? '' : 's'}
                        </p>
                      </div>
                      <span className="shrink-0 font-medium text-foreground">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1 rounded-lg bg-surface-muted px-4 py-3 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Rental period</span>
                  <span>
                    {formatDate(order.startDate)} → {formatDate(order.endDate)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
                  <span>Amount due</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-border px-4 py-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Secured by SSLCommerz</p>
                  <p className="text-muted">
                    You will be redirected to the gateway to complete payment. GearUp never
                    stores your card details.
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handlePay}
                loading={createPayment.isPending || redirecting}
              >
                <Lock className="size-4" aria-hidden />
                {redirecting
                  ? 'Redirecting…'
                  : `Pay ${formatCurrency(order.totalAmount)}`}
              </Button>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
