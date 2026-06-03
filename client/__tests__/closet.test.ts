import { describe, expect, it } from 'vitest';

import {
  filterItemsByCategory,
  formatCategoryLabel,
  getCategoryFilters,
} from '../lib/closet-filters';
import type { ClosetItem } from '../lib/types/closet';

const makeItem = (overrides: Partial<ClosetItem> = {}): ClosetItem => ({
  id: '1',
  user_id: 'user-1',
  category: 'outerwear',
  image_url: null,
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('lib/closet-filters', () => {
  describe('formatCategoryLabel', () => {
    it('returns Uncategorized for null or blank category', () => {
      expect(formatCategoryLabel(null)).toBe('Uncategorized');
      expect(formatCategoryLabel('   ')).toBe('Uncategorized');
    });

    it('title-cases words in category', () => {
      expect(formatCategoryLabel('raw denim')).toBe('Raw Denim');
      expect(formatCategoryLabel('OUTERWEAR')).toBe('Outerwear');
    });
  });

  describe('getCategoryFilters', () => {
    it('always includes All Items first', () => {
      const filters = getCategoryFilters([]);
      expect(filters[0]).toEqual({ value: null, label: 'All Items' });
    });

    it('dedupes and sorts categories', () => {
      const items = [
        makeItem({ id: '1', category: 'shirts' }),
        makeItem({ id: '2', category: 'outerwear' }),
        makeItem({ id: '3', category: 'shirts' }),
        makeItem({ id: '4', category: null }),
      ];

      const filters = getCategoryFilters(items);

      expect(filters).toHaveLength(3);
      expect(filters[1]).toEqual({ value: 'outerwear', label: 'Outerwear' });
      expect(filters[2]).toEqual({ value: 'shirts', label: 'Shirts' });
    });
  });

  describe('filterItemsByCategory', () => {
    const items = [
      makeItem({ id: '1', category: 'outerwear' }),
      makeItem({ id: '2', category: 'shirts' }),
      makeItem({ id: '3', category: null }),
    ];

    it('returns all items when category is null', () => {
      expect(filterItemsByCategory(items, null)).toHaveLength(3);
    });

    it('filters by exact category match', () => {
      const filtered = filterItemsByCategory(items, 'shirts');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('2');
    });

    it('excludes null-category items when a chip is selected', () => {
      const filtered = filterItemsByCategory(items, 'outerwear');
      expect(filtered.every((item) => item.category === 'outerwear')).toBe(true);
      expect(filtered).toHaveLength(1);
    });
  });
});
