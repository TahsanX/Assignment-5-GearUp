'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { ImageOff, Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { useDeleteGear, useProviderGear } from '@/hooks/use-provider';
import { errorMessage } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button, LinkButton } from '@/components/ui/button';
import { TableWrap, Td, Th } from '@/components/dashboard/data-table';
import { TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function ProviderInventoryPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, error } = useProviderGear(user?.id);
  const deleteGear = useDeleteGear();
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(
    null,
  );

  if (isLoading) return <TableSkeleton rows={5} cols={5} />;
  if (isError) return <ErrorAlert message={errorMessage(error)} />;

  const gear = data ?? [];

  async function handleDelete() {
    if (!pendingDelete) return;
    try {
      await deleteGear.mutateAsync(pendingDelete.id);
      toast.success('Gear removed', { description: `${pendingDelete.name} is no longer listed.` });
      setPendingDelete(null);
    } catch (err) {
      toast.error('Could not remove gear', { description: errorMessage(err) });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">
          My inventory{' '}
          <span className="text-sm font-normal text-muted">({gear.length})</span>
        </h2>
        <LinkButton href="/dashboard/provider/gear/new" size="sm">
          <Plus className="size-4" aria-hidden />
          Add gear
        </LinkButton>
      </div>

      {gear.length === 0 ? (
        <EmptyState
          icon={<Package className="size-10" />}
          title="No gear listed yet"
          description="Add your first item so customers can start renting it."
          action={<LinkButton href="/dashboard/provider/gear/new">Add your first gear</LinkButton>}
        />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Gear</Th>
              <Th>Category</Th>
              <Th>Price / day</Th>
              <Th>Stock</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {gear.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-surface-muted">
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                      {item.images?.[0] ? (
                        <Image
                          src={item.images[0]}
                          alt=""
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-muted">
                          <ImageOff className="size-4" aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/gear/${item.id}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {item.name}
                      </Link>
                      {item.brand && <p className="text-xs text-muted">{item.brand}</p>}
                    </div>
                  </div>
                </Td>
                <Td className="whitespace-nowrap text-muted">{item.category?.name ?? '—'}</Td>
                <Td className="font-semibold whitespace-nowrap">
                  {formatCurrency(item.pricePerDay)}
                </Td>
                <Td>{item.stock}</Td>
                <Td>
                  <Badge
                    className={
                      item.isAvailable && item.stock > 0
                        ? 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300'
                        : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
                    }
                  >
                    {item.isAvailable && item.stock > 0 ? 'Available' : 'Hidden'}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex justify-end gap-2">
                    <LinkButton
                      href={`/dashboard/provider/gear/${item.id}/edit`}
                      variant="outline"
                      size="sm"
                    >
                      <Pencil className="size-3.5" aria-hidden />
                      Edit
                    </LinkButton>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Delete ${item.name}`}
                      onClick={() => setPendingDelete({ id: item.id, name: item.name })}
                      className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Remove this gear?"
        description={`"${pendingDelete?.name}" will be removed from the catalogue. This cannot be undone.`}
        confirmLabel="Remove"
        pending={deleteGear.isPending}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
