import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import type { GearItem } from '@/lib/types';
import { GearDetails } from './gear-details';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * `cache` dedupes this across generateMetadata and the page render, so a page
 * view costs one backend call. Both entry points must surface the 404 — if
 * metadata swallowed it, the response would commit as 200 before the page
 * could call notFound().
 */
const loadGear = cache(async (id: string): Promise<GearItem> => {
  try {
    return await apiFetch<GearItem>(`/gear/${id}`, {
      token: null,
      next: { revalidate: 30 },
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const gear = await loadGear(id);
  return { title: gear.name, description: gear.description.slice(0, 155) };
}

export default async function GearDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const gear = await loadGear(id);
  return <GearDetails gear={gear} />;
}
