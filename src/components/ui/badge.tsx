import type { RentalStatus } from '@/lib/types';
import { cn, STATUS_STYLES, statusLabel } from '@/lib/utils';

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Colour-coded rental status pill, per the assignment's badge legend. */
export function StatusBadge({ status }: { status: RentalStatus }) {
  return <Badge className={STATUS_STYLES[status]}>{statusLabel(status)}</Badge>;
}

const PAYMENT_STYLES: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300',
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
};

export function PaymentBadge({ status }: { status: string }) {
  return (
    <Badge className={PAYMENT_STYLES[status] ?? 'bg-surface-muted text-muted'}>
      {statusLabel(status)}
    </Badge>
  );
}
