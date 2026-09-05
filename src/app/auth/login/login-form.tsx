'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuth } from '@/providers/auth-provider';
import { useLoginMutation } from '@/hooks/use-auth-mutations';
import { loginSchema, type LoginValues } from '@/lib/validation';
import { ApiError, errorMessage } from '@/lib/api';
import { dashboardPath } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { Card, CardBody } from '@/components/ui/card';
import { ErrorAlert } from '@/components/ui/alert';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();
  const mutation = useLoginMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const { user, token } = await mutation.mutateAsync(values);
      login(user, token);
      toast.success(`Welcome back, ${user.name}`);
      const redirect = params.get('redirect');
      router.push(redirect || dashboardPath(user.role));
      router.refresh();
    } catch (err) {
      // Map backend field issues onto inputs; show the rest as a form-level alert.
      if (err instanceof ApiError) {
        const fields = err.fieldErrors;
        let mapped = false;
        for (const [key, message] of Object.entries(fields)) {
          if (key === 'email' || key === 'password') {
            setError(key, { message });
            mapped = true;
          }
        }
        if (!mapped) setFormError(err.message);
      } else {
        setFormError(errorMessage(err));
      }
      toast.error('Login failed', { description: errorMessage(err) });
    }
  });

  return (
    <Card>
      <CardBody className="space-y-6 p-6 sm:p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage your rentals.</p>
        </div>

        {formError && <ErrorAlert message={formError} />}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
