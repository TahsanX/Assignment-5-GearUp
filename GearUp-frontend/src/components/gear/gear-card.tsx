import Image from 'next/image';
import Link from 'next/link';
import { ImageOff, Star } from 'lucide-react';
import type { GearItem } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

function averageRating(gear: GearItem): number | null {
  if (!gear.reviews?.length) return null;
  const sum = gear.reviews.reduce((acc, r) => acc + r.rating, 0);
  return sum / gear.reviews.length;
}

export function GearCard({ gear }: { gear: GearItem }) {
  const image = gear.images?.[0];
  const rating = averageRating(gear);

  return (
    <Link
      href={`/gear/${gear.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-surface-muted">
        {image ? (
          <Image
            src={image}
            alt={gear.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted">
            <ImageOff className="size-10" aria-hidden />
          </div>
        )}
        {gear.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55">
            <Badge className="bg-white text-neutral-900">Out of stock</Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold text-foreground">{gear.name}</h3>
          {rating !== null && (
            <span className="flex shrink-0 items-center gap-1 text-xs text-muted">
              <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        <p className="line-clamp-2 text-sm text-muted">{gear.description}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div>
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(gear.pricePerDay)}
            </span>
            <span className="text-xs text-muted"> /day</span>
          </div>
          {gear.category && (
            <Badge className="bg-surface-muted text-muted">{gear.category.name}</Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
