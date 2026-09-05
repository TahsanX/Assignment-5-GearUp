'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import { useGearItem } from '@/hooks/use-gear';
import { useUpdateGear, type GearFormValues } from '@/hooks/use-provider';
import { useAuth } from '@/providers/auth-provider';
import { errorMessage } from '@/lib/api';
import { GearForm } from '@/components/dashboard/gear-form';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorAlert } from '@/components/ui/alert';

export default function EditGearPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { data: gear, isLoading, isError, error } = useGearItem(id);
  const updateGear = useUpdateGear();
  const [formError, setFormError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[32rem]" />
      </div>
    );
  }

  if (isError || !gear) {
    return <ErrorAlert message={errorMessage(error) || 'Gear item not found.'} />;
  }

  // The API rejects this too, but failing here avoids a pointless round-trip.
  if (user && gear.providerId !== user.id) {
    return <ErrorAlert message="You can only edit gear you listed yourself." />;
  }

  async function handleSubmit(values: GearFormValues) {
    setFormError(null);
    try {
      await updateGear.mutateAsync({ id, values });
      toast.success('Gear updated', { description: `${values.name} has been saved.` });
      router.push('/dashboard/provider/gear');
    } catch (err) {
      const message = errorMessage(err);
      setFormError(message);
      toast.error('Could not update gear', { description: message });
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
        <h2 className="text-lg font-semibold text-foreground">Edit gear</h2>
        <p className="mt-0.5 text-sm text-muted">Update the details for {gear.name}.</p>
      </div>

      <GearForm
        initial={gear}
        submitLabel="Save changes"
        pending={updateGear.isPending}
        formError={formError}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
