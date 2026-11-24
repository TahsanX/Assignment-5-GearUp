'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { Payment, PaymentSession, RentalOrder, Review } from '@/lib/types';

export function useMyRentals() {
  return useQuery({
    queryKey: ['rentals'],
    queryFn: () => apiFetch<RentalOrder[]>('/rentals'),
  });
}

export function useRental(id: string) {
  return useQuery({
    queryKey: ['rentals', id],
    queryFn: () => apiFetch<RentalOrder>(`/rentals/${id}`),
    enabled: !!id,
  });
}

export function useMyPayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: () => apiFetch<Payment[]>('/payments'),
  });
}

interface CreateRentalInput {
  startDate: string;
  endDate: string;
  items: { gearItemId: string; quantity: number }[];
}

export function useCreateRental() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRentalInput) =>
      apiFetch<RentalOrder>('/rentals', { method: 'POST', body: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rentals'] });
    },
  });
}

/** Creates an SSLCommerz session; the caller redirects to `paymentUrl`. */
export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rentalOrderId: string) =>
      apiFetch<PaymentSession>('/payments/create', {
        method: 'POST',
        body: { rentalOrderId },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

interface CreateReviewInput {
  gearItemId: string;
  rentalOrderId: string;
  rating: number;
  comment?: string;
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReviewInput) =>
      apiFetch<Review>('/reviews', { method: 'POST', body: input }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['rentals'] });
      qc.invalidateQueries({ queryKey: ['gear', variables.gearItemId] });
    },
  });
}
