import { describe, expect, it } from 'vitest';

import {
  filterItemsBySubcategory,
  formatSubcategoryLabel,
  getSubcategoryFilters,
} from '../lib/closet-filters';
import type { ClosetItem } from '../lib/types/closet';

// [GenAI Use] Prompt:
// "Write unit tests for the closet filter helpers in lib/closet-filters.ts."
// [GenAI Use] LLM Response Start
const makeItem = (overrides: Partial<ClosetItem> = {}): ClosetItem => ({
  id: '1',
  user_id: 'user-1',
  category: 'Outerwear',
  subcategory: 'Hoodie',
  item_name: null,
  image_url: null,
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('lib/closet-filters', () => {
  describe('formatSubcategoryLabel', () => {
    it('returns Uncategorized for null or blank subcategory', () => {
      expect(formatSubcategoryLabel(null)).toBe('Uncategorized');
      expect(formatSubcategoryLabel('   ')).toBe('Uncategorized');
    });

    it('title-cases words in subcategory', () => {
      expect(formatSubcategoryLabel('raw denim')).toBe('Raw Denim');
      expect(formatSubcategoryLabel('sneakers')).toBe('Sneakers');
    });
  });

  describe('getSubcategoryFilters', () => {
    it('always includes All Items first', () => {
      const filters = getSubcategoryFilters([]);
      expect(filters[0]).toEqual({ value: null, label: 'All Items' });
    });

    it('dedupes and sorts subcategories', () => {
      const items = [
        makeItem({ id: '1', subcategory: 'Hoodie' }),
        makeItem({ id: '2', subcategory: 'Coat' }),
        makeItem({ id: '3', subcategory: 'Hoodie' }),
        makeItem({ id: '4', subcategory: null }),
      ];

      const filters = getSubcategoryFilters(items);

      expect(filters).toHaveLength(3);
      expect(filters[1]).toEqual({ value: 'Coat', label: 'Coat' });
      expect(filters[2]).toEqual({ value: 'Hoodie', label: 'Hoodie' });
    });
  });

  describe('filterItemsBySubcategory', () => {
    const items = [
      makeItem({ id: '1', subcategory: 'Hoodie' }),
      makeItem({ id: '2', subcategory: 'Jeans' }),
      makeItem({ id: '3', subcategory: null }),
    ];

    it('returns all items when subcategory is null', () => {
      expect(filterItemsBySubcategory(items, null)).toHaveLength(3);
    });

    it('filters by exact subcategory match', () => {
      const filtered = filterItemsBySubcategory(items, 'Jeans');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('2');
    });

    it('excludes null-subcategory items when a chip is selected', () => {
      const filtered = filterItemsBySubcategory(items, 'Hoodie');
      expect(filtered.every((item) => item.subcategory === 'Hoodie')).toBe(true);
      expect(filtered).toHaveLength(1);
    });
  });
});
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection:
// I ran each test and checked the outputs against how the closet screen should behave.
// I added edge cases the first draft missed, e.g. "excludes null-subcategory items when
// a chip is selected" so uncategorized items do not show under a specific filter chip.
