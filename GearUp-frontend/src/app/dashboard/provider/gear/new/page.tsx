'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import { useCreateGear, type GearFormValues } from '@/hooks/use-provider';
import { errorMessage } from '@/lib/api';
import { GearForm } from '@/components/dashboard/gear-form';

export default function NewGearPage() {
  const router = useRouter();
  const createGear = useCreateGear();
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(values: GearFormValues) {
    setFormError(null);
    try {
      await createGear.mutateAsync(values);
      toast.success('Gear listed', { description: `${values.name} is now in your inventory.` });
      router.push('/dashboard/provider/gear');
    } catch (err) {
      const message = errorMessage(err);
      setFormError(message);
      toast.error('Could not list gear', { description: message });
    }
  }

  return (
    <div className="space-y-5">
      <Link
        href="/dashboard/provider/gear"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Back to inventory
      </Link>

      <div>
        <h2 className="text-lg font-semibold text-foreground">Add new gear</h2>
        <p className="mt-0.5 text-sm text-muted">
          List a new item for customers to rent.
        </p>
      </div>

      <GearForm
        submitLabel="List gear"
        pending={createGear.isPending}
        formError={formError}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
