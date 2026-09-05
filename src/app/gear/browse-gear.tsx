'use client';

import { useMemo, useState } from 'react';
import { PackageSearch, Search } from 'lucide-react';
import { useGearList, type GearFilters } from '@/hooks/use-gear';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { GearCard } from '@/components/gear/gear-card';
import { GearFiltersPanel } from '@/components/gear/gear-filters';
import { GearGridSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { errorMessage } from '@/lib/api';

const EMPTY: GearFilters = {};

export function BrowseGear() {
  const [filters, setFilters] = useState<GearFilters>(EMPTY);

  // Debounce the free-text inputs so typing doesn't fire a request per keypress.
  const debouncedSearch = useDebouncedValue(filters.searchTerm, 350);
  const debouncedBrand = useDebouncedValue(filters.brand, 350);
  const debouncedMin = useDebouncedValue(filters.minPrice, 350);
  const debouncedMax = useDebouncedValue(filters.maxPrice, 350);

  const queryFilters = useMemo(
    () => ({
      searchTerm: debouncedSearch,
      brand: debouncedBrand,
      minPrice: debouncedMin,
      maxPrice: debouncedMax,
      category: filters.category,
    }),
    [debouncedSearch, debouncedBrand, debouncedMin, debouncedMax, filters.category],
  );

  const { data, isLoading, isError, error, refetch, isFetching } =
    useGearList(queryFilters);

  const patch = (p: Partial<GearFilters>) => setFilters((prev) => ({ ...prev, ...p }));

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <GearFiltersPanel
          filters={filters}
          onChange={patch}
          onReset={() => setFilters(EMPTY)}
        />
      </div>

      <div className="space-y-5">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search bikes, tents, kayaks…"
            aria-label="Search gear"
            value={filters.searchTerm ?? ''}
            onChange={(e) => patch({ searchTerm: e.target.value })}
            className="w-full rounded-lg border border-border bg-surface py-2.5 pr-4 pl-10 text-sm text-foreground placeholder:text-muted focus:outline-2 focus:outline-primary"
          />
        </div>

        {isLoading ? (
          <GearGridSkeleton />
        ) : isError ? (
          <ErrorAlert
            message={errorMessage(error)}
            action={
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            }
          />
        ) : !data?.length ? (
          <EmptyState
            icon={<PackageSearch className="size-10" />}
            title="No gear matches those filters"
            description="Try widening your price range or clearing the category filter."
            action={
              <Button variant="outline" onClick={() => setFilters(EMPTY)}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            <p className="text-sm text-muted" aria-live="polite">
              {data.length} item{data.length === 1 ? '' : 's'} available
              {isFetching && ' · updating…'}
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {data.map((gear) => (
                <GearCard key={gear.id} gear={gear} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
