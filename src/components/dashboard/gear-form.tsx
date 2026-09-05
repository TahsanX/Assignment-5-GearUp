'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImageOff } from 'lucide-react';
import type { GearItem } from '@/lib/types';
import { useCategories } from '@/hooks/use-gear';
import {
  gearSchema,
  parseImageList,
  type GearFormInput,
  type GearFormOutput,
} from '@/lib/validation';
import type { GearFormValues } from '@/hooks/use-provider';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/field';
import { Card, CardBody } from '@/components/ui/card';
import { ErrorAlert } from '@/components/ui/alert';

interface Props {
  initial?: GearItem;
  submitLabel: string;
  pending: boolean;
  formError?: string | null;
  onSubmit: (values: GearFormValues) => void;
}

export function GearForm({ initial, submitLabel, pending, formError, onSubmit }: Props) {
  const { data: categories, isLoading: loadingCategories } = useCategories();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<GearFormInput, unknown, GearFormOutput>({
    resolver: zodResolver(gearSchema),
    defaultValues: {
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      brand: initial?.brand ?? '',
      pricePerDay: initial ? String(initial.pricePerDay) : '',
      stock: initial ? String(initial.stock) : '1',
      categoryId: initial?.categoryId ?? '',
      images: initial?.images?.join('\n') ?? '',
      isAvailable: initial?.isAvailable ?? true,
    },
  });

  // Live preview of whatever URLs are currently in the textarea.
  const imagePreview = parseImageList(watch('images'));
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  // `parsed` is the schema's output: prices and stock already coerced to numbers.
  const submit = handleSubmit((parsed) => {
    onSubmit({
      name: parsed.name,
      description: parsed.description,
      brand: parsed.brand?.trim() || undefined,
      pricePerDay: parsed.pricePerDay,
      stock: parsed.stock,
      categoryId: parsed.categoryId,
      images: parseImageList(parsed.images),
      isAvailable: parsed.isAvailable,
    });
  });

  return (
    <Card>
      <CardBody className="p-6">
        <form onSubmit={submit} className="space-y-5" noValidate>
          {formError && <ErrorAlert message={formError} />}

          <Input
            label="Gear name"
            placeholder="Trek Mountain Bike"
            error={errors.name?.message}
            {...register('name')}
          />

          <Textarea
            label="Description"
            placeholder="All-terrain mountain bike, great for trails and rough roads."
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Brand"
              placeholder="Trek"
              hint="Optional"
              error={errors.brand?.message}
              {...register('brand')}
            />
            <Select
              label="Category"
              disabled={loadingCategories}
              error={errors.categoryId?.message}
              {...register('categoryId')}
            >
              <option value="">Select a category…</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Price per day (USD)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="15.00"
              error={errors.pricePerDay?.message}
              {...register('pricePerDay')}
            />
            <Input
              label="Stock"
              type="number"
              min="0"
              placeholder="1"
              hint="How many units you can rent out at once"
              error={errors.stock?.message}
              {...register('stock')}
            />
          </div>

          <Textarea
            label="Image URLs"
            placeholder={'https://example.com/bike-1.jpg\nhttps://example.com/bike-2.jpg'}
            hint="One URL per line (or comma separated). Optional."
            error={errors.images?.message}
            {...register('images')}
          />

          {imagePreview.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Preview</p>
              <div className="flex flex-wrap gap-3">
                {imagePreview.map((src) => (
                  <div
                    key={src}
                    className="relative size-24 overflow-hidden rounded-lg border border-border bg-surface-muted"
                  >
                    {brokenImages.has(src) ? (
                      <div className="flex size-full items-center justify-center text-muted">
                        <ImageOff className="size-6" aria-hidden />
                      </div>
                    ) : (
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="96px"
                        className="object-cover"
                        onError={() =>
                          setBrokenImages((prev) => new Set(prev).add(src))
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <label className="flex items-center gap-2.5">
            <input
              type="checkbox"
              className="size-4 rounded border-border accent-teal-600"
              {...register('isAvailable')}
            />
            <span className="text-sm text-foreground">
              Available for rent — uncheck to hide this item from the catalogue
            </span>
          </label>

          <Button type="submit" size="lg" loading={pending}>
            {pending ? 'Saving…' : submitLabel}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
