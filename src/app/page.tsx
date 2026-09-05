import Link from 'next/link';
import { ArrowRight, CalendarCheck, ShieldCheck, Truck } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import type { GearItem } from '@/lib/types';
import { GearCard } from '@/components/gear/gear-card';
import { LinkButton } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/alert';

// Featured gear is public data; cache it briefly rather than hitting the API
// on every visit.
async function getFeaturedGear(): Promise<{ gear: GearItem[]; error: string | null }> {
  try {
    const gear = await apiFetch<GearItem[]>('/gear', {
      token: null,
      next: { revalidate: 60 },
    });
    return { gear: gear.slice(0, 8), error: null };
  } catch {
    return { gear: [], error: 'We could not load featured gear right now.' };
  }
}

const PERKS = [
  {
    icon: CalendarCheck,
    title: 'Book by the day',
    body: 'Pick your dates and see the exact total before you commit.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure payments',
    body: 'Checkout runs through the SSLCommerz gateway end to end.',
  },
  {
    icon: Truck,
    title: 'Local providers',
    body: 'Rent from vetted shops and collect the gear near you.',
  },
];

export default async function HomePage() {
  const { gear, error } = await getFeaturedGear();

  return (
    <>
      <section className="border-b border-border bg-linear-to-b from-surface-muted to-background">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl">
            Rent sports &amp; outdoor gear{' '}
            <span className="text-primary">instantly</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-pretty text-muted">
            Bikes, tents, kayaks and more — from trusted local providers. Choose your
            dates, pay securely, and hit the trail.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <LinkButton href="/gear" size="lg">
              Browse gear
              <ArrowRight className="size-4" aria-hidden />
            </LinkButton>
            <LinkButton href="/auth/register" size="lg" variant="outline">
              List your gear
            </LinkButton>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {PERKS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-border bg-surface p-6">
              <Icon className="size-6 text-primary" aria-hidden />
              <h2 className="mt-3 font-semibold text-foreground">{title}</h2>
              <p className="mt-1 text-sm text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Featured gear
            </h2>
            <p className="mt-1 text-sm text-muted">Fresh listings from our providers.</p>
          </div>
          <Link
            href="/gear"
            className="hidden shrink-0 text-sm font-medium text-primary hover:underline sm:block"
          >
            View all →
          </Link>
        </div>

        {error ? (
          <ErrorAlert message={error} />
        ) : gear.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center text-sm text-muted">
            No gear has been listed yet. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gear.map((item) => (
              <GearCard key={item.id} gear={item} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
