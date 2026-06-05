import { describe, expect, it } from 'vitest';

import { Category, SUBCATEGORIES } from '../constants/categories';
import { SLOTS, SUB_TO_CAT } from '../components/avatar/slots';
import type { SlotCategory, SlotIndices } from '../components/avatar/slots';
import type { SubcategoryFilters } from '../components/avatar/filter-modal';
import type { ClosetItem } from '../lib/types/closet';

// helpers

const makeItem = (overrides: Partial<ClosetItem> = {}): ClosetItem => ({
  id: '1',
  user_id: 'user-1',
  category: 'tops',
  subcategory: 'T-Shirt',
  item_name: 'My Tee',
  image_url: null,
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

// mirrors avatar.tsx grouped memo
function groupItems(
  items: ClosetItem[],
  filters: SubcategoryFilters,
): Record<SlotCategory, ClosetItem[]> {
  const result: Record<SlotCategory, ClosetItem[]> = {
    [Category.TOPS]: [],
    [Category.BOTTOMS]: [],
    [Category.SHOES]: [],
  };
  for (const item of items) {
    const catFromSub = item.subcategory
      ? SUB_TO_CAT[item.subcategory.toLowerCase()]
      : undefined;
    const catFromField = item.category?.toLowerCase() as SlotCategory | undefined;
    const cat = catFromSub ?? catFromField;
    if (!cat || !(cat in result)) continue;

    const activeFilters = filters[cat];
    if (
      activeFilters.length > 0 &&
      item.subcategory &&
      !activeFilters.some((f) => f.toLowerCase() === item.subcategory!.toLowerCase())
    )
      continue;

    result[cat].push(item);
  }
  return result;
}

const emptyFilters: SubcategoryFilters = {
  [Category.TOPS]: [],
  [Category.BOTTOMS]: [],
  [Category.SHOES]: [],
};

// mirrors filter modal logic
function toggleSub(
  filters: SubcategoryFilters,
  category: SlotCategory,
  sub: string,
): SubcategoryFilters {
  const current = filters[category];
  const next = current.includes(sub)
    ? current.filter((s) => s !== sub)
    : [...current, sub];
  return { ...filters, [category]: next };
}

function clearAll(): SubcategoryFilters {
  const cleared = {} as SubcategoryFilters;
  for (const { category } of SLOTS) cleared[category] = [];
  return cleared;
}

// mirrors avatar.tsx navigate
function navigate(
  indices: SlotIndices,
  grouped: Record<SlotCategory, ClosetItem[]>,
  category: SlotCategory,
  dir: 1 | -1,
): SlotIndices {
  const len = grouped[category].length;
  if (len === 0) return indices;
  return { ...indices, [category]: (indices[category] + dir + len) % len };
}

// slots constants

describe('SLOTS', () => {
  it('contains exactly 3 entries: tops, bottoms, shoes', () => {
    const cats = SLOTS.map((s) => s.category);
    expect(cats).toEqual([Category.TOPS, Category.BOTTOMS, Category.SHOES]);
  });

  it('maps slot names correctly', () => {
    const slotNames = Object.fromEntries(SLOTS.map((s) => [s.category, s.slot]));
    expect(slotNames[Category.TOPS]).toBe('top');
    expect(slotNames[Category.BOTTOMS]).toBe('bottom');
    expect(slotNames[Category.SHOES]).toBe('footwear');
  });

  it('each entry has a non-empty label', () => {
    SLOTS.forEach((s) => expect(s.label.length).toBeGreaterThan(0));
  });
});


describe('SUB_TO_CAT', () => {
  it('maps known tops subcategories', () => {
    for (const sub of SUBCATEGORIES[Category.TOPS]) {
      expect(SUB_TO_CAT[sub.toLowerCase()]).toBe(Category.TOPS);
    }
  });

  it('maps known bottoms subcategories', () => {
    for (const sub of SUBCATEGORIES[Category.BOTTOMS]) {
      expect(SUB_TO_CAT[sub.toLowerCase()]).toBe(Category.BOTTOMS);
    }
  });

  it('maps known shoes subcategories', () => {
    for (const sub of SUBCATEGORIES[Category.SHOES]) {
      expect(SUB_TO_CAT[sub.toLowerCase()]).toBe(Category.SHOES);
    }
  });

  it('does NOT include outerwear or accessories', () => {
    for (const sub of SUBCATEGORIES[Category.OUTERWEAR]) {
      expect(SUB_TO_CAT[sub.toLowerCase()]).toBeUndefined();
    }
    for (const sub of SUBCATEGORIES[Category.ACCESSORIES]) {
      expect(SUB_TO_CAT[sub.toLowerCase()]).toBeUndefined();
    }
  });
});

// group items logic

describe('groupItems', () => {
  it('places items into the correct slot by category field', () => {
    const items = [
      makeItem({ id: '1', category: 'tops', subcategory: null }),
      makeItem({ id: '2', category: 'bottoms', subcategory: null }),
      makeItem({ id: '3', category: 'shoes', subcategory: null }),
    ];
    const grouped = groupItems(items, emptyFilters);
    expect(grouped[Category.TOPS].map((i) => i.id)).toContain('1');
    expect(grouped[Category.BOTTOMS].map((i) => i.id)).toContain('2');
    expect(grouped[Category.SHOES].map((i) => i.id)).toContain('3');
  });

  it('uses subcategory lookup (SUB_TO_CAT) over category field when both present', () => {
    // wrong category field, correct subcategory
    const item = makeItem({ id: '1', category: 'shoes', subcategory: 'T-Shirt' });
    const grouped = groupItems([item], emptyFilters);
    expect(grouped[Category.TOPS].map((i) => i.id)).toContain('1');
    expect(grouped[Category.SHOES]).toHaveLength(0);
  });

  it('excludes items with unknown category and no matching subcategory', () => {
    const item = makeItem({ id: '1', category: 'outerwear', subcategory: null });
    const grouped = groupItems([item], emptyFilters);
    expect(grouped[Category.TOPS]).toHaveLength(0);
    expect(grouped[Category.BOTTOMS]).toHaveLength(0);
    expect(grouped[Category.SHOES]).toHaveLength(0);
  });

  it('is case-insensitive for category field', () => {
    const item = makeItem({ id: '1', category: 'TOPS', subcategory: null });
    const grouped = groupItems([item], emptyFilters);
    expect(grouped[Category.TOPS]).toHaveLength(1);
  });

  it('filters out items that do not match active subcategory filter', () => {
    const items = [
      makeItem({ id: '1', category: 'tops', subcategory: 'T-Shirt' }),
      makeItem({ id: '2', category: 'tops', subcategory: 'Sweater' }),
    ];
    const filters: SubcategoryFilters = {
      ...emptyFilters,
      [Category.TOPS]: ['T-Shirt'],
    };
    const grouped = groupItems(items, filters);
    expect(grouped[Category.TOPS].map((i) => i.id)).toEqual(['1']);
  });

  it('includes all items when filter for a category is empty', () => {
    const items = [
      makeItem({ id: '1', category: 'tops', subcategory: 'T-Shirt' }),
      makeItem({ id: '2', category: 'tops', subcategory: 'Sweater' }),
    ];
    const grouped = groupItems(items, emptyFilters);
    expect(grouped[Category.TOPS]).toHaveLength(2);
  });

  it('includes items with null subcategory when no filter is active', () => {
    const item = makeItem({ id: '1', category: 'tops', subcategory: null });
    const grouped = groupItems([item], emptyFilters);
    expect(grouped[Category.TOPS]).toHaveLength(1);
  });

  it('keeps null-subcategory items even when a filter is active', () => {
    // filter skips null-subcategory items
    const items = [
      makeItem({ id: '1', category: 'tops', subcategory: null }),
      makeItem({ id: '2', category: 'tops', subcategory: 'T-Shirt' }),
      makeItem({ id: '3', category: 'tops', subcategory: 'Sweater' }),
    ];
    const filters: SubcategoryFilters = {
      ...emptyFilters,
      [Category.TOPS]: ['T-Shirt'],
    };
    const grouped = groupItems(items, filters);
    const ids = grouped[Category.TOPS].map((i) => i.id);
    expect(ids).toContain('1'); // null-sub passes
    expect(ids).toContain('2'); // matches filter
    expect(ids).not.toContain('3'); // excluded
  });
});

// navigate logic

describe('navigate', () => {
  const items = [
    makeItem({ id: 'a' }),
    makeItem({ id: 'b' }),
    makeItem({ id: 'c' }),
  ];
  const grouped: Record<SlotCategory, ClosetItem[]> = {
    [Category.TOPS]: items,
    [Category.BOTTOMS]: [],
    [Category.SHOES]: [],
  };
  const baseIndices: SlotIndices = {
    [Category.TOPS]: 0,
    [Category.BOTTOMS]: 0,
    [Category.SHOES]: 0,
  };

  it('advances index forward', () => {
    const next = navigate(baseIndices, grouped, Category.TOPS, 1);
    expect(next[Category.TOPS]).toBe(1);
  });

  it('wraps forward past the last item', () => {
    const atLast = { ...baseIndices, [Category.TOPS]: 2 };
    const next = navigate(atLast, grouped, Category.TOPS, 1);
    expect(next[Category.TOPS]).toBe(0);
  });

  it('wraps backward before the first item', () => {
    const next = navigate(baseIndices, grouped, Category.TOPS, -1);
    expect(next[Category.TOPS]).toBe(2);
  });

  it('does nothing when slot is empty', () => {
    const next = navigate(baseIndices, grouped, Category.BOTTOMS, 1);
    expect(next[Category.BOTTOMS]).toBe(0);
  });

  it('does not mutate other slot indices', () => {
    const next = navigate(baseIndices, grouped, Category.TOPS, 1);
    expect(next[Category.BOTTOMS]).toBe(baseIndices[Category.BOTTOMS]);
    expect(next[Category.SHOES]).toBe(baseIndices[Category.SHOES]);
  });
});

// togglesub / clearall

describe('toggleSub', () => {
  it('adds a subcategory when not present', () => {
    const next = toggleSub(emptyFilters, Category.TOPS, 'T-Shirt');
    expect(next[Category.TOPS]).toContain('T-Shirt');
  });

  it('removes a subcategory when already present', () => {
    const withFilter: SubcategoryFilters = {
      ...emptyFilters,
      [Category.TOPS]: ['T-Shirt', 'Sweater'],
    };
    const next = toggleSub(withFilter, Category.TOPS, 'T-Shirt');
    expect(next[Category.TOPS]).not.toContain('T-Shirt');
    expect(next[Category.TOPS]).toContain('Sweater');
  });

  it('does not mutate the original filters', () => {
    const original = { ...emptyFilters };
    toggleSub(emptyFilters, Category.TOPS, 'T-Shirt');
    expect(emptyFilters[Category.TOPS]).toEqual(original[Category.TOPS]);
  });

  it('only changes the targeted category', () => {
    const withFilter: SubcategoryFilters = {
      ...emptyFilters,
      [Category.BOTTOMS]: ['Jeans'],
    };
    const next = toggleSub(withFilter, Category.TOPS, 'T-Shirt');
    expect(next[Category.BOTTOMS]).toEqual(['Jeans']);
  });
});

describe('clearAll', () => {
  it('resets all slot categories to empty arrays', () => {
    const cleared = clearAll();
    for (const { category } of SLOTS) {
      expect(cleared[category]).toEqual([]);
    }
  });

  it('covers every category in SLOTS', () => {
    const cleared = clearAll();
    expect(Object.keys(cleared)).toHaveLength(SLOTS.length);
  });
});
