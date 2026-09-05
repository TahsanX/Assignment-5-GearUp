import type { RentalStatus } from './types';

/** Tailwind-friendly conditional class joiner. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(value: string | number): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return '$0.00';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function formatDate(value: string | Date): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Today as `yyyy-mm-dd`, used as the `min` on rental date pickers. */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Rental days are inclusive of both the start and end date, so a same-day
 * rental still costs one day.
 */
export function rentalDays(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
  const diff = Math.floor((e.getTime() - s.getTime()) / 86_400_000);
  return diff < 0 ? 0 : diff + 1;
}

export const STATUS_STYLES: Record<RentalStatus, string> = {
  PLACED: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
  PAID: 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300',
  PICKED_UP: 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300',
  RETURNED: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300',
};

export function statusLabel(status: string): string {
  return status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}
