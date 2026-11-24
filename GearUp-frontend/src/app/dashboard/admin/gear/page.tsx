'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ImageOff, Package, Search } from 'lucide-react';
import { useAdminGear } from '@/hooks/use-admin';
import { errorMessage } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { TableWrap, Td, Th } from '@/components/dashboard/data-table';
import { Pagination } from '@/components/dashboard/pagination';
import { TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/alert';

const PAGE_SIZE = 8;

export default function AdminGearPage() {
  const { data, isLoading, isError, error } = useAdminGear();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data ?? [];
    return (data ?? []).filter(
      (g) =>
        g.name.toLowerCase().includes(term) ||
        g.brand?.toLowerCase().includes(term) ||
        g.provider?.name?.toLowerCase().includes(term),
    );
  }, [data, search]);

  if (isLoading) return <TableSkeleton rows={8} cols={5} />;
  if (isError) return <ErrorAlert message={errorMessage(error)} />;

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">
        All gear <span className="text-sm font-normal text-muted">({filtered.length})</span>
      </h2>

      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          type="search"
          placeholder="Search by gear, brand or provider…"
          aria-label="Search gear"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-lg border border-border bg-surface py-2 pr-4 pl-10 text-sm text-foreground placeholder:text-muted focus:outline-2 focus:outline-primary"
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<Package className="size-10" />}
          title="No gear matches your search"
          description="Try a different gear name, brand or provider."
        />
      ) : (
        <>
          <TableWrap>
            <thead>
              <tr>
                <Th>Gear</Th>
                <Th>Provider</Th>
                <Th>Category</Th>
                <Th>Price / day</Th>
                <Th>Status</Th>
                <Th>Listed</Th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-surface-muted">
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                        {item.images?.[0] ? (
                          <Image src={item.images[0]} alt="" fill sizes="40px" className="object-cover" />
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
                  <Td className="text-muted">{item.provider?.name ?? '—'}</Td>
                  <Td className="whitespace-nowrap text-muted">{item.category?.name ?? '—'}</Td>
                  <Td className="font-semibold whitespace-nowrap">
                    {formatCurrency(item.pricePerDay)}
                  </Td>
                  <Td>
                    <Badge
                      className={
                        item.isAvailable
                          ? 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300'
                          : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
                      }
                    >
                      {item.isAvailable ? 'Available' : 'Hidden'}
                    </Badge>
                  </Td>
                  <Td className="whitespace-nowrap text-muted">{formatDate(item.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>

          <Pagination
            page={safePage}
            pageCount={pageCount}
            total={filtered.length}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
