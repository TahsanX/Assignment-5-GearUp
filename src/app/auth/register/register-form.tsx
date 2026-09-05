'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Store, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { useRegisterMutation } from '@/hooks/use-auth-mutations';
import { registerSchema, type RegisterValues } from '@/lib/validation';
import { ApiError, errorMessage } from '@/lib/api';
import { dashboardPath } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { Card, CardBody } from '@/components/ui/card';
import { ErrorAlert } from '@/components/ui/alert';

const ROLE_OPTIONS = [
  {
    value: 'CUSTOMER' as const,
    icon: UserIcon,
    title: 'Customer',
    body: 'Rent gear for your next trip',
  },
  {
    value: 'PROVIDER' as const,
    icon: Store,
    title: 'Provider',
    body: 'List and rent out your gear',
  },
];

export function RegisterForm() {
  const router = useRouter();
  const { login } = useAuth();
  const mutation = useRegisterMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', phone: '', role: 'CUSTOMER' },
  });

  const role = watch('role');

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const { user, token } = await mutation.mutateAsync({
        ...values,
        phone: values.phone?.trim() || undefined,
      });
      login(user, token);
      toast.success(`Welcome to GearUp, ${user.name}!`);
      router.push(dashboardPath(user.role));
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        const fields = err.fieldErrors;
        let mapped = false;
        for (const [key, message] of Object.entries(fields)) {
          if (key in values) {
            setError(key as keyof RegisterValues, { message });
            mapped = true;
          }
        }
        if (!mapped) setFormError(err.message);
      } else {
        setFormError(errorMessage(err));
      }
      toast.error('Registration failed', { description: errorMessage(err) });
    }
  });

  return (
    <Card>
      <CardBody className="space-y-6 p-6 sm:p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-muted">Start renting or listing gear today.</p>
        </div>

        {formError && <ErrorAlert message={formError} />}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <fieldset>
            <legend className="mb-2 block text-sm font-medium text-foreground">
              I want to join as
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {ROLE_OPTIONS.map(({ value, icon: Icon, title, body }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={role === value}
                  onClick={() => setValue('role', value, { shouldValidate: true })}
                  className={cn(
                    'rounded-lg border-2 p-3 text-left transition-colors',
                    role === value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted',
                  )}
                >
                  <Icon className="size-5 text-primary" aria-hidden />
                  <p className="mt-1.5 text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted">{body}</p>
                </button>
              ))}
            </div>
          </fieldset>

          <Input
            label="Full name"
            autoComplete="name"
            placeholder="Alex Rivera"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Phone"
            type="tel"
            autoComplete="tel"
            placeholder="01700000000"
            hint="Optional — used by providers to reach you."
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
