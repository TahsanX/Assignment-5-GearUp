'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Category, GearItem, RentalOrder, User, UserStatus } from '@/lib/types';

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiFetch<User[]>('/admin/users'),
  });
}

export function useAdminGear() {
  return useQuery({
    queryKey: ['admin-gear'],
    queryFn: () => apiFetch<GearItem[]>('/admin/gear'),
  });
}

export function useAdminRentals() {
  return useQuery({
    queryKey: ['admin-rentals'],
    queryFn: () => apiFetch<RentalOrder[]>('/admin/rentals'),
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      apiFetch<User>(`/admin/users/${id}`, { method: 'PATCH', body: { status } }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['admin-users'] });
      const previous = qc.getQueryData<User[]>(['admin-users']);
      qc.setQueryData<User[]>(['admin-users'], (old) =>
        old?.map((u) => (u.id === id ? { ...u, status } : u)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(['admin-users'], context.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      apiFetch<Category>('/admin/categories', { method: 'POST', body: { name } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
