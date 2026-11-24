'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { useCreateCategory } from '@/hooks/use-admin';
import { useCategories } from '@/hooks/use-gear';
import { errorMessage } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';

export function CategoryManager() {
  const { data: categories } = useCategories();
  const createCategory = useCreateCategory();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError('Category name must be at least 2 characters.');
      return;
    }
    setError(null);

    try {
      await createCategory.mutateAsync(trimmed);
      toast.success('Category created', { description: `"${trimmed}" is now available.` });
      setName('');
    } catch (err) {
      const message = errorMessage(err);
      setError(message);
      toast.error('Could not create category', { description: message });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {categories?.length ? (
            categories.map((c) => (
              <Badge key={c.id} className="bg-surface-muted text-muted">
                {c.name}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted">No categories yet.</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="New category"
            placeholder="e.g. Climbing"
            value={name}
            error={error ?? undefined}
            onChange={(e) => setName(e.target.value)}
          />
          <Button type="submit" size="sm" loading={createCategory.isPending}>
            <Plus className="size-4" aria-hidden />
            Add category
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
