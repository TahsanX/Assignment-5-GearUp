'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ImageOff, Star, Store } from 'lucide-react';
import type { GearItem } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { RentNowPanel } from './rent-now-panel';

export function GearDetails({ gear }: { gear: GearItem }) {
  const [active, setActive] = useState(0);
  const images = gear.images ?? [];
  const reviews = gear.reviews ?? [];
  const avg = reviews.length
    ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
    : null;

  const specs = Object.entries(
    (gear.specifications as Record<string, unknown> | null) ?? {},
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/gear"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Back to browse
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-8">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-border bg-surface-muted">
              {images[active] ? (
                <Image
                  src={images[active]}
                  alt={`${gear.name} — image ${active + 1}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-2 text-muted">
                  <ImageOff className="size-12" aria-hidden />
                  <span className="text-sm">No image provided</span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((src, i) => (
                  <button
                    key={src + i}
                    onClick={() => setActive(i)}
                    aria-label={`View image ${i + 1}`}
                    aria-current={i === active}
                    className={`relative size-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      i === active ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              {gear.category && (
                <Badge className="bg-surface-muted text-muted">{gear.category.name}</Badge>
              )}
              {gear.brand && (
                <Badge className="bg-surface-muted text-muted">{gear.brand}</Badge>
              )}
              <Badge
                className={
                  gear.isAvailable && gear.stock > 0
                    ? 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300'
                }
              >
                {gear.isAvailable && gear.stock > 0 ? 'Available' : 'Unavailable'}
              </Badge>
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
              {gear.name}
            </h1>

            {avg !== null && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
                <span className="font-medium text-foreground">{avg.toFixed(1)}</span>
                <span>
                  · {reviews.length} review{reviews.length === 1 ? '' : 's'}
                </span>
              </p>
            )}

            <p className="mt-4 leading-relaxed text-pretty text-muted">{gear.description}</p>
          </div>

          {specs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardBody>
                <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {specs.map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-4 border-b border-border pb-2">
                      <dt className="text-sm text-muted capitalize">{key}</dt>
                      <dd className="text-sm font-medium text-foreground">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </CardBody>
            </Card>
          )}

          {gear.provider && (
            <Card>
              <CardHeader>
                <CardTitle>Provided by</CardTitle>
              </CardHeader>
              <CardBody className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-surface-muted">
                  <Store className="size-5 text-primary" aria-hidden />
                </div>
                <div>
                  <p className="font-medium text-foreground">{gear.provider.name}</p>
                  {gear.provider.email && (
                    <p className="text-sm text-muted">{gear.provider.email}</p>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Reviews ({reviews.length})</CardTitle>
            </CardHeader>
            <CardBody>
              {reviews.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted">
                  No reviews yet — be the first to rent and review this gear.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {reviews.map((review) => (
                    <li key={review.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-foreground">
                          {review.customer?.name ?? 'Customer'}
                        </p>
                        <span className="text-xs text-muted">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <div className="mt-1 flex gap-0.5" aria-label={`${review.rating} out of 5`}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={
                              i < review.rating
                                ? 'size-4 fill-amber-400 text-amber-400'
                                : 'size-4 text-border'
                            }
                            aria-hidden
                          />
                        ))}
                      </div>
                      {review.comment && (
                        <p className="mt-2 text-sm text-muted">{review.comment}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <RentNowPanel gear={gear} />
        </div>
      </div>
    </div>
  );
}

export { formatCurrency };
