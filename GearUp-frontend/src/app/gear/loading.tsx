import { GearGridSkeleton, Skeleton } from '@/components/ui/skeleton';

export default function GearLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="mt-3 h-4 w-80" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <Skeleton className="h-96 rounded-xl" />
        <div className="space-y-5">
          <Skeleton className="h-11 rounded-lg" />
          <GearGridSkeleton count={6} />
        </div>
      </div>
    </div>
  );
}
