'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Search, Users } from 'lucide-react';
import type { User } from '@/lib/types';
import { useAdminUsers, useUpdateUserStatus } from '@/hooks/use-admin';
import { useAuth } from '@/providers/auth-provider';
import { errorMessage } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/field';
import { TableWrap, Td, Th } from '@/components/dashboard/data-table';
import { Pagination } from '@/components/dashboard/pagination';
import { TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorAlert } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const PAGE_SIZE = 8;

const ROLE_STYLES: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300',
  PROVIDER: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',
  CUSTOMER: 'bg-surface-muted text-muted',
};

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { data, isLoading, isError, error } = useAdminUsers();
  const updateStatus = useUpdateUserStatus();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<User | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data ?? []).filter((u) => {
      const matchesTerm =
        !term ||
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term);
      const matchesRole = !roleFilter || u.role === roleFilter;
      return matchesTerm && matchesRole;
    });
  }, [data, search, roleFilter]);

  if (isLoading) return <TableSkeleton rows={8} cols={5} />;
  if (isError) return <ErrorAlert message={errorMessage(error)} />;

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  async function handleToggle() {
    if (!target) return;
    const nextStatus = target.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await updateStatus.mutateAsync({ id: target.id, status: nextStatus });
      toast.success(
        nextStatus === 'SUSPENDED' ? 'Account suspended' : 'Account reactivated',
        { description: target.name },
      );
      setTarget(null);
    } catch (err) {
      toast.error('Could not update account', { description: errorMessage(err) });
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">
        Users <span className="text-sm font-normal text-muted">({filtered.length})</span>
      </h2>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search by name or email…"
            aria-label="Search users"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-border bg-surface py-2 pr-4 pl-10 text-sm text-foreground placeholder:text-muted focus:outline-2 focus:outline-primary"
          />
        </div>
        <div className="sm:w-44">
          <Select
            label="Role"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="PROVIDER">Provider</option>
            <option value="ADMIN">Admin</option>
          </Select>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<Users className="size-10" />}
          title="No users match your search"
          description="Try a different name, email or role filter."
        />
      ) : (
        <>
          <TableWrap>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Joined</Th>
                <Th className="text-right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {visible.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="transition-colors hover:bg-surface-muted">
                    <Td>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs break-all text-muted">{u.email}</p>
                    </Td>
                    <Td>
                      <Badge className={ROLE_STYLES[u.role]}>{u.role}</Badge>
                    </Td>
                    <Td>
                      <Badge
                        className={
                          u.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300'
                        }
                      >
                        {u.status === 'ACTIVE' ? 'Active' : 'Suspended'}
                      </Badge>
                    </Td>
                    <Td className="whitespace-nowrap text-muted">{formatDate(u.createdAt)}</Td>
                    <Td className="text-right">
                      {isSelf ? (
                        <span className="text-xs text-muted">You</span>
                      ) : (
                        <Button
                          size="sm"
                          variant={u.status === 'ACTIVE' ? 'outline' : 'primary'}
                          onClick={() => setTarget(u)}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </Button>
                      )}
                    </Td>
                  </tr>
                );
              })}
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

      <ConfirmDialog
        open={!!target}
        destructive={target?.status === 'ACTIVE'}
        title={target?.status === 'ACTIVE' ? 'Suspend this account?' : 'Reactivate this account?'}
        description={
          target?.status === 'ACTIVE'
            ? `${target?.name} will be blocked from signing in until reactivated.`
            : `${target?.name} will be able to sign in again.`
        }
        confirmLabel={target?.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
        pending={updateStatus.isPending}
        onConfirm={handleToggle}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
