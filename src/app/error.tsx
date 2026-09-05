'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button, LinkButton } from '@/components/ui/button';

/** Route-level error boundary for unexpected client/server render failures. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route error:', error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/15">
        <AlertTriangle className="size-8 text-red-600 dark:text-red-400" aria-hidden />
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
        Something went wrong
      </h1>
      <p className="mt-2 text-pretty text-muted">
        We hit an unexpected error loading this page. Trying again usually fixes it.
      </p>
      {error.digest && (
        <p className="mt-3 font-mono text-xs text-muted">Reference: {error.digest}</p>
      )}
      <div className="mt-7 flex flex-col gap-2 sm:flex-row">
        <Button onClick={reset}>
          <RotateCcw className="size-4" aria-hidden />
          Try again
        </Button>
        <LinkButton href="/" variant="outline">
          Go home
        </LinkButton>
      </div>
    </div>
  );
}
