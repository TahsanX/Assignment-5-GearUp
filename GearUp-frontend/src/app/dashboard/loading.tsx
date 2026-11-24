import { StatsSkeleton, TableSkeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <StatsSkeleton />
      <TableSkeleton rows={6} cols={5} />
    </div>
  );
}
