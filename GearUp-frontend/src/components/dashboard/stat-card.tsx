import type { LucideIcon } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/card';

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <Card>
      <CardBody className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm text-muted">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          {hint && <p className="mt-0.5 truncate text-xs text-muted">{hint}</p>}
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted">
          <Icon className="size-5 text-primary" aria-hidden />
        </div>
      </CardBody>
    </Card>
  );
}
