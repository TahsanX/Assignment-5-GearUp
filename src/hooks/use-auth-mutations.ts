'use client';

import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import type { AuthPayload, Role } from '@/lib/types';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: Extract<Role, 'CUSTOMER' | 'PROVIDER'>;
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      apiFetch<AuthPayload>('/auth/login', { method: 'POST', body: input, token: null }),
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (input: RegisterInput) =>
      apiFetch<AuthPayload>('/auth/register', { method: 'POST', body: input, token: null }),
  });
}
