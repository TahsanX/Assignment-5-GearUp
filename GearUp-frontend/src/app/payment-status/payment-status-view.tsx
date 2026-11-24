'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle } from 'lucide-react';
import { LinkButton } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';

export function PaymentStatusView() {
  const params = useSearchParams();
  const queryClient = useQueryClient();

  const status = params.get('status');
  const transactionId = params.get('transactionId');
  const succeeded = status === 'success';

  // The order status changed server-side during the gateway round-trip.
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['rentals'] });
    queryClient.invalidateQueries({ queryKey: ['payments'] });
  }, [queryClient]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col justify-center px-4 py-12">
      <Card>
        <CardBody className="space-y-5 p-8 text-center">
          {succeeded ? (
            <CheckCircle2
              className="mx-auto size-16 text-green-600 dark:text-green-400"
              aria-hidden
            />
          ) : (
            <XCircle className="mx-auto size-16 text-red-600 dark:text-red-400" aria-hidden />
          )}

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {succeeded ? 'Payment successful' : 'Payment not completed'}
            </h1>
            <p className="mt-2 text-pretty text-muted">
              {succeeded
                ? 'Your rental is paid and confirmed. The provider will get it ready for pickup.'
                : 'We could not confirm your payment. No charge was captured — you can safely try again.'}
            </p>
          </div>

          {transactionId && (
            <div className="rounded-lg bg-surface-muted px-4 py-3 text-left">
              <p className="text-xs text-muted">Transaction ID</p>
              <p className="font-mono text-xs break-all text-foreground">{transactionId}</p>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <LinkButton href="/dashboard/customer/orders" className="flex-1">
              View my rentals
            </LinkButton>
            <LinkButton href="/gear" variant="outline" className="flex-1">
              Browse more gear
            </LinkButton>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
