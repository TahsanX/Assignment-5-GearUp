import { Compass } from 'lucide-react';
import { LinkButton } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-surface-muted">
        <Compass className="size-8 text-primary" aria-hidden />
      </div>
      <p className="mt-6 text-sm font-semibold tracking-widest text-primary uppercase">
        404
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
        This page went off-trail
      </h1>
      <p className="mt-2 text-pretty text-muted">
        The page you are looking for does not exist or may have been moved.
      </p>
      <div className="mt-7 flex flex-col gap-2 sm:flex-row">
        <LinkButton href="/">Go home</LinkButton>
        <LinkButton href="/gear" variant="outline">
          Browse gear
        </LinkButton>
      </div>
    </div>
  );
}
