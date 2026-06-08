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
  // [GenAI Use] Prompt:
  // "Add pull-to-refresh so users can reload their closet items without the full-screen loading spinner."
  // [GenAI Use] LLM Response Start
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
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
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  const refresh = useCallback(() => load(true), [load]);
  // [GenAI Use] LLM Response End (Note: not all of above is AI generated, only the functionality related to pull-to-refresh)
  // [GenAI Use] Reflection:
  // I wanted refresh to feel different from the initial load by keeping the grid visible
  // while pulling down, instead of swapping to the full-screen spinner again.

  useEffect(() => {
    load();
  }, [load]);

  // [GenAI Use] Prompt:
  // "Only rebuild the filter chips and filtered item list when items or the selected subcategory change."
  // [GenAI Use] LLM Response Start
  const subcategoryFilters: CategoryFilter[] = useMemo(
    () => getSubcategoryFilters(items),
    [items],
  );

  const filteredItems = useMemo(
    () => filterItemsBySubcategory(items, selectedSubcategory),
    [items, selectedSubcategory],
  );
  // [GenAI Use] LLM Response End
  // [GenAI Use] Reflection:
  // Without this, the filters and grid could recalculate on every render. useMemo keeps
  // that work tied to when items or the active chip actually changes.

  return {
    subcategoryFilters,
    selectedSubcategory,
    setSelectedSubcategory,
    filteredItems,
    loading,
    refreshing,
    error,
    refresh,
  };
}
