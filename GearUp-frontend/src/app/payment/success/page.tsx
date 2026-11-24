import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Payment successful', robots: { index: false } };

/** Alias for the gateway return URL, kept so `/payment/success` also resolves. */
export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const tx = typeof params.transactionId === 'string' ? params.transactionId : '';
  redirect(`/payment-status?status=success${tx ? `&transactionId=${tx}` : ''}`);
}
