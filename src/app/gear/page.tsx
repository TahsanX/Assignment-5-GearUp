import type { Metadata } from 'next';
import { BrowseGear } from './browse-gear';

export const metadata: Metadata = {
  title: 'Browse Gear',
  description: 'Search and filter sports and outdoor equipment available to rent.',
};

export default function GearPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Browse gear</h1>
        <p className="mt-1 text-muted">
          Filter by category, brand and price to find your next adventure kit.
        </p>
      </header>
      <BrowseGear />
    </div>
  );
}
