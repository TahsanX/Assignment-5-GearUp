import Link from 'next/link';
import { Mountain } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
            <Mountain className="size-5 text-primary" aria-hidden />
            GearUp
          </Link>
          <p className="mt-1 text-sm text-muted">Rent sports &amp; outdoor gear instantly.</p>
        </div>
        <div className="flex gap-6 text-sm text-muted">
          <Link href="/gear" className="hover:text-foreground">Browse gear</Link>
          <Link href="/auth/register" className="hover:text-foreground">Become a provider</Link>
        </div>
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} GearUp. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
