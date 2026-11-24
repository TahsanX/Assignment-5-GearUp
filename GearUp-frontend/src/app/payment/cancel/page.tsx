import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Payment cancelled', robots: { index: false } };

/** Alias for the gateway cancel URL, kept so `/payment/cancel` also resolves. */
export default async function PaymentCancelPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const tx = typeof params.transactionId === 'string' ? params.transactionId : '';
  redirect(`/payment-status?status=cancelled${tx ? `&transactionId=${tx}` : ''}`);
}
