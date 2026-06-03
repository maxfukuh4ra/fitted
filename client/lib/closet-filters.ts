// Filter bar used in closet screen
import type { CategoryFilter, ClosetItem } from '@/lib/types/closet';

export function formatCategoryLabel(category: string | null): string {
  if (!category?.trim()) {
    return 'Uncategorized';
  }

  return category
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function getCategoryFilters(items: ClosetItem[]): CategoryFilter[] {
  const categories = [
    ...new Set(
      items
        .map((item) => item.category)
        .filter((category): category is string => category != null && category.trim() !== ''),
    ),
  ].sort((a, b) => a.localeCompare(b));

  return [
    { value: null, label: 'All Items' },
    ...categories.map((category) => ({
      value: category,
      label: formatCategoryLabel(category),
    })),
  ];
}

export function filterItemsByCategory(
  items: ClosetItem[],
  selectedCategory: string | null,
): ClosetItem[] {
  if (selectedCategory === null) {
    return items;
  }

  return items.filter((item) => item.category === selectedCategory);
}
