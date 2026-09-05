'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CalendarDays, Lock } from 'lucide-react';
import type { GearItem } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';
import { useCreateRental } from '@/hooks/use-rentals';
import { errorMessage } from '@/lib/api';
import { formatCurrency, rentalDays, todayISO } from '@/lib/utils';
import { Button, LinkButton } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input } from '@/components/ui/field';

export function RentNowPanel({ gear }: { gear: GearItem }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const createRental = useCreateRental();

  const today = todayISO();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const days = startDate && endDate ? rentalDays(startDate, endDate) : 0;
  const total = days * Number(gear.pricePerDay) * quantity;
  const rentable = gear.isAvailable && gear.stock > 0;

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!startDate) next.startDate = 'Pick a start date.';
    if (!endDate) next.endDate = 'Pick an end date.';
    if (startDate && startDate < today) next.startDate = 'Start date cannot be in the past.';
    if (startDate && endDate && endDate < startDate) {
      next.endDate = 'End date must be on or after the start date.';
    }
    if (quantity < 1) next.quantity = 'Rent at least one unit.';
    if (quantity > gear.stock) next.quantity = `Only ${gear.stock} in stock.`;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      const order = await createRental.mutateAsync({
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        items: [{ gearItemId: gear.id, quantity }],
      });
      toast.success('Rental order placed', {
        description: 'Your provider will confirm it shortly.',
      });
      router.push(`/dashboard/customer/orders/${order.id}`);
    } catch (err) {
      toast.error('Could not place your order', { description: errorMessage(err) });
    }
  }

  return (
    <Card>
      <CardBody className="space-y-5">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground">
            {formatCurrency(gear.pricePerDay)}
          </span>
          <span className="text-muted">/ day</span>
        </div>

        {!rentable ? (
          <p className="rounded-lg bg-surface-muted px-4 py-3 text-sm text-muted">
            This gear is currently unavailable. Check back later or browse similar items.
          </p>
        ) : loading ? (
          <div className="skeleton h-40 rounded-lg" />
        ) : !user ? (
          <div className="space-y-3">
            <p className="flex items-start gap-2 rounded-lg bg-surface-muted px-4 py-3 text-sm text-muted">
              <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
              Sign in as a customer to rent this gear.
            </p>
            <LinkButton
              href={`/auth/login?redirect=/gear/${gear.id}`}
              className="w-full"
              size="lg"
            >
              Sign in to rent
            </LinkButton>
          </div>
        ) : user.role !== 'CUSTOMER' ? (
          <p className="rounded-lg bg-surface-muted px-4 py-3 text-sm text-muted">
            You are signed in as a {user.role.toLowerCase()}. Only customer accounts can
            rent gear.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start date"
                type="date"
                min={today}
                value={startDate}
                error={errors.startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                label="End date"
                type="date"
                min={startDate || today}
                value={endDate}
                error={errors.endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <Input
              label="Quantity"
              type="number"
              min={1}
              max={gear.stock}
              value={quantity}
              error={errors.quantity}
              hint={`${gear.stock} available`}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />

            {days > 0 && (
              <div className="space-y-2 rounded-lg bg-surface-muted px-4 py-3 text-sm">
                <div className="flex justify-between text-muted">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-4" aria-hidden />
                    {formatCurrency(gear.pricePerDay)} × {days} day
                    {days === 1 ? '' : 's'} × {quantity}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 font-semibold text-foreground">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={createRental.isPending}
            >
              {createRental.isPending ? 'Placing order…' : 'Rent now'}
            </Button>

            <p className="text-center text-xs text-muted">
              You will pay after the provider confirms your order.
            </p>
          </form>
        )}
      </CardBody>
    </Card>
  );
}
