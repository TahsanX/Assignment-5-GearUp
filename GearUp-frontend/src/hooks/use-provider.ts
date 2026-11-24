'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { GearItem, RentalOrder, RentalStatus } from '@/lib/types';

export interface GearFormValues {
  name: string;
  description: string;
  brand?: string;
  pricePerDay: number;
  stock?: number;
  images?: string[];
  categoryId: string;
  isAvailable?: boolean;
}

/**
 * The backend has no "list my gear" route, so the provider's inventory is the
 * public gear list narrowed to the signed-in provider.
 */
export function useProviderGear(providerId: string | undefined) {
  return useQuery({
    queryKey: ['provider-gear', providerId],
    queryFn: async () => {
      const all = await apiFetch<GearItem[]>('/gear', { token: null });
      return all.filter((g) => g.providerId === providerId);
    },
    enabled: !!providerId,
  });
}

export function useProviderOrders() {
  return useQuery({
    queryKey: ['provider-orders'],
    queryFn: () => apiFetch<RentalOrder[]>('/provider/orders'),
  });
}

export function useCreateGear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: GearFormValues) =>
      apiFetch<GearItem>('/provider/gear', { method: 'POST', body: values }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider-gear'] });
      qc.invalidateQueries({ queryKey: ['gear'] });
    },
  });
}

export function useUpdateGear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<GearFormValues> }) =>
      apiFetch<GearItem>(`/provider/gear/${id}`, { method: 'PUT', body: values }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider-gear'] });
      qc.invalidateQueries({ queryKey: ['gear'] });
    },
  });
}

export function useDeleteGear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<null>(`/provider/gear/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider-gear'] });
      qc.invalidateQueries({ queryKey: ['gear'] });
    },
  });
}

export type ProviderOrderStatus = Extract<
  RentalStatus,
  'CONFIRMED' | 'PICKED_UP' | 'RETURNED' | 'CANCELLED'
>;

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProviderOrderStatus }) =>
      apiFetch<RentalOrder>(`/provider/orders/${id}`, {
        method: 'PATCH',
        body: { status },
      }),
    // Reflect the new status in the table immediately, rolling back on failure.
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['provider-orders'] });
      const previous = qc.getQueryData<RentalOrder[]>(['provider-orders']);
      qc.setQueryData<RentalOrder[]>(['provider-orders'], (old) =>
        old?.map((o) => (o.id === id ? { ...o, status } : o)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(['provider-orders'], context.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['provider-orders'] });
    },
  });
}
