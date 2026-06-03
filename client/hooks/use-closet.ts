// Hook to fetch and filter closet items by subcategory
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getCurrentUser } from '@/lib/auth';
import {
  filterItemsBySubcategory,
  getSubcategoryFilters,
} from '@/lib/closet-filters';
import { fetchClosetItems } from '@/lib/items';
import type { CategoryFilter, ClosetItem } from '@/lib/types/closet';

export function useCloset() {
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const user = await getCurrentUser();
      if (!user) {
        setItems([]);
        setError('Sign in to view your closet.');
        return;
      }

      const fetchedItems = await fetchClosetItems(user.id);
      setItems(fetchedItems);
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : 'Failed to load closet.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const subcategoryFilters: CategoryFilter[] = useMemo(
    () => getSubcategoryFilters(items),
    [items],
  );

  const filteredItems = useMemo(
    () => filterItemsBySubcategory(items, selectedSubcategory),
    [items, selectedSubcategory],
  );

  return {
    subcategoryFilters,
    selectedSubcategory,
    setSelectedSubcategory,
    filteredItems,
    loading,
    error,
    refresh: load,
  };
}
