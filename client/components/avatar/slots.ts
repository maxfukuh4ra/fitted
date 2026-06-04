import { Category, SUBCATEGORIES } from '@/constants/categories';

export const SLOTS = [
  { label: 'Top', category: Category.TOPS, slot: 'top', slotFlex: 6 },
  { label: 'Bottom', category: Category.BOTTOMS, slot: 'bottom', slotFlex: 7 },
  { label: 'Shoes', category: Category.SHOES, slot: 'footwear', slotFlex: 5 },
] as const;

export type SlotCategory = (typeof SLOTS)[number]['category'];
export type SlotIndices = Record<SlotCategory, number>;

const SLOT_CATEGORIES = new Set<string>([Category.TOPS, Category.BOTTOMS, Category.SHOES]);

export const SUB_TO_CAT: Record<string, SlotCategory> = {};
for (const [cat, subs] of Object.entries(SUBCATEGORIES)) {
  if (SLOT_CATEGORIES.has(cat)) {
    for (const sub of subs) {
      SUB_TO_CAT[sub.toLowerCase()] = cat as SlotCategory;
    }
  }
}
