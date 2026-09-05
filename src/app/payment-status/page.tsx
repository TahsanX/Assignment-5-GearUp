import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PaymentStatusView } from './payment-status-view';

export const metadata: Metadata = {
  title: 'Payment status',
  robots: { index: false },
};

/**
 * SSLCommerz returns the customer to the backend, which redirects here with
 * `?transactionId=…&status=success|failed`.
 */
export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 py-20">
          <div className="skeleton h-72 rounded-xl" />
        </div>
      }
    >
      <PaymentStatusView />
    </Suspense>
  );
}
