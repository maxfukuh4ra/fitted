// Filter helpers for closet screen (chips and grid use subcategory)
import type { CategoryFilter, ClosetItem } from '@/lib/types/closet';

export function formatSubcategoryLabel(subcategory: string | null): string {
  if (!subcategory?.trim()) {
    return 'Uncategorized';
  }

  // [GenAI Use] Prompt:
  // "Format raw subcategory strings from the database into readable labels for the filter chips."
  // [GenAI Use] LLM Response Start
  return subcategory
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  // [GenAI Use] LLM Response End
  // [GenAI Use] Reflection:
  // Subcategories come in inconsistent casing (e.g. "Zip jacket"). This turns them into
  // display labels like "Zip Jacket" for the chip bar.
}

export function getSubcategoryFilters(items: ClosetItem[]): CategoryFilter[] {
  const subcategories = [
    ...new Set(
      items
        .map((item) => item.subcategory)
        .filter(
          (subcategory): subcategory is string =>
            subcategory != null && subcategory.trim() !== '',
        ),
    ),
  ].sort((a, b) => a.localeCompare(b));

  return [
    { value: null, label: 'All Items' },
    ...subcategories.map((subcategory) => ({
      value: subcategory,
      label: formatSubcategoryLabel(subcategory),
    })),
  ];
}

export function filterItemsBySubcategory(
  items: ClosetItem[],
  selectedSubcategory: string | null,
): ClosetItem[] {
  if (selectedSubcategory === null) {
    return items;
  }

  return items.filter((item) => item.subcategory === selectedSubcategory);
}
