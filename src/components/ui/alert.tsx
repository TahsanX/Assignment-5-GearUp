import { AlertCircle } from 'lucide-react';

/** Inline, non-toast error surface for failed queries and form submissions. */
export function ErrorAlert({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="flex-1">
        <p>{message}</p>
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}
