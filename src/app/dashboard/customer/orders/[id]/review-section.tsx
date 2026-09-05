'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import type { RentalOrder } from '@/lib/types';
import { useCreateReview } from '@/hooks/use-rentals';
import { errorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/field';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';

/** Reviews are only meaningful once the gear has come back. */
export function ReviewSection({ order }: { order: RentalOrder }) {
  const createReview = useCreateReview();
  const [gearItemId, setGearItemId] = useState(order.items?.[0]?.gearItemId ?? '');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (order.status !== 'RETURNED') return null;

  const reviewedIds = new Set((order.reviews ?? []).map((r) => r.gearItemId));
  const reviewable = (order.items ?? []).filter((i) => !reviewedIds.has(i.gearItemId));

  if (reviewable.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your review</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-muted">
            Thanks — you have already reviewed the gear in this order.
          </p>
        </CardBody>
      </Card>
    );
  }

  const activeId = gearItemId || reviewable[0].gearItemId;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError('Please pick a star rating.');
      return;
    }
    setError(null);

    try {
      await createReview.mutateAsync({
        gearItemId: activeId,
        rentalOrderId: order.id,
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success('Review submitted', { description: 'Thanks for the feedback!' });
      setRating(0);
      setComment('');
    } catch (err) {
      const message = errorMessage(err);
      setError(message);
      toast.error('Could not submit review', { description: message });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave a review</CardTitle>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          {reviewable.length > 1 && (
            <div className="space-y-1.5">
              <label htmlFor="review-gear" className="block text-sm font-medium text-foreground">
                Which item?
              </label>
              <select
                id="review-gear"
                value={activeId}
                onChange={(e) => setGearItemId(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-2 focus:outline-primary"
              >
                {reviewable.map((item) => (
                  <option key={item.gearItemId} value={item.gearItemId}>
                    {item.gearItem?.name ?? 'Gear item'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <span className="block text-sm font-medium text-foreground">Rating</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  aria-label={`${value} star${value === 1 ? '' : 's'}`}
                  aria-pressed={rating === value}
                  className="rounded p-0.5 focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <Star
                    className={cn(
                      'size-7 transition-colors',
                      value <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-border hover:text-amber-300',
                    )}
                    aria-hidden
                  />
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Comment"
            placeholder="How did the gear hold up?"
            hint="Optional"
            value={comment}
            error={error ?? undefined}
            onChange={(e) => setComment(e.target.value)}
          />

          <Button type="submit" loading={createReview.isPending}>
            {createReview.isPending ? 'Submitting…' : 'Submit review'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
