import type { Metadata } from 'next';
import { ShieldOff } from 'lucide-react';
import { LinkButton } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Access denied', robots: { index: false } };

/** Where middleware sends a signed-in user who hits another role's dashboard. */
export default function ForbiddenPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/15">
        <ShieldOff className="size-8 text-amber-600 dark:text-amber-400" aria-hidden />
      </div>
      <p className="mt-6 text-sm font-semibold tracking-widest text-amber-600 uppercase dark:text-amber-400">
        403
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
        Access denied
      </h1>
      <p className="mt-2 text-pretty text-muted">
        Your account role does not have permission to view that dashboard.
      </p>
      <div className="mt-7 flex flex-col gap-2 sm:flex-row">
        <LinkButton href="/dashboard">Go to my dashboard</LinkButton>
        <LinkButton href="/" variant="outline">
          Go home
        </LinkButton>
      </div>
    </div>
  );
}
