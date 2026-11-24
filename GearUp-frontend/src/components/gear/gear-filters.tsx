'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import type { GearFilters } from '@/hooks/use-gear';
import { useCategories } from '@/hooks/use-gear';
import { Input, Select } from '@/components/ui/field';
import { Button } from '@/components/ui/button';

interface Props {
  filters: GearFilters;
  onChange: (patch: Partial<GearFilters>) => void;
  onReset: () => void;
}

export function GearFiltersPanel({ filters, onChange, onReset }: Props) {
  const { data: categories, isLoading } = useCategories();

  const hasFilters = Object.values(filters).some(
    (v) => v !== undefined && String(v).trim() !== '',
  );

  return (
    <aside className="space-y-5 rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="size-4" aria-hidden />
          Filters
        </h2>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="size-3.5" aria-hidden />
            Clear
          </Button>
        )}
      </div>

      <Select
        label="Category"
        value={filters.category ?? ''}
        onChange={(e) => onChange({ category: e.target.value })}
        disabled={isLoading}
      >
        <option value="">All categories</option>
        {categories?.map((c) => (
          <option key={c.id} value={c.name}>
            {c.name}
          </option>
        ))}
      </Select>

      <Input
        label="Brand"
        placeholder="e.g. Trek"
        value={filters.brand ?? ''}
        onChange={(e) => onChange({ brand: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Min price"
          type="number"
          min={0}
          placeholder="0"
          value={filters.minPrice ?? ''}
          onChange={(e) => onChange({ minPrice: e.target.value })}
        />
        <Input
          label="Max price"
          type="number"
          min={0}
          placeholder="500"
          value={filters.maxPrice ?? ''}
          onChange={(e) => onChange({ maxPrice: e.target.value })}
        />
      </div>
      <p className="text-xs text-muted">Prices are per day, in USD.</p>
    </aside>
  );
}
