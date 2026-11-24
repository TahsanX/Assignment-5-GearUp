'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Category, GearItem } from '@/lib/types';

export interface GearFilters {
  searchTerm?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
}

/** Drops empty values so we never send `?brand=` to the API. */
export function gearQueryString(filters: GearFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      params.set(key, String(value).trim());
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function useGearList(filters: GearFilters = {}) {
  return useQuery({
    queryKey: ['gear', filters],
    queryFn: () => apiFetch<GearItem[]>(`/gear${gearQueryString(filters)}`, { token: null }),
  });
}

export function useGearItem(id: string) {
  return useQuery({
    queryKey: ['gear', id],
    queryFn: () => apiFetch<GearItem>(`/gear/${id}`, { token: null }),
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<Category[]>('/categories', { token: null }),
    staleTime: 5 * 60_000,
  });
}
