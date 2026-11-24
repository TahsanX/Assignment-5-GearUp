import { Skeleton } from '@/components/ui/skeleton';

export default function GearDetailsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-4 w-32" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <Skeleton className="aspect-4/3 w-full rounded-xl" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );
}
