import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import type { GearItem } from '@/lib/types';
import { GearDetails } from './gear-details';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getGear(id: string): Promise<GearItem> {
  try {
    return await apiFetch<GearItem>(`/gear/${id}`, {
      token: null,
      next: { revalidate: 30 },
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const gear = await apiFetch<GearItem>(`/gear/${id}`, { token: null });
    return { title: gear.name, description: gear.description.slice(0, 155) };
  } catch {
    return { title: 'Gear details' };
  }
}

export default async function GearDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const gear = await getGear(id);
  return <GearDetails gear={gear} />;
}
