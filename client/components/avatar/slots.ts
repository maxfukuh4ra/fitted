import { Category, SUBCATEGORIES } from '@/constants/categories';

export const SLOTS = [
  { label: 'Top', category: Category.TOPS, slot: 'top', slotFlex: 6 },
  { label: 'Bottom', category: Category.BOTTOMS, slot: 'bottom', slotFlex: 7 },
  { label: 'Shoes', category: Category.SHOES, slot: 'footwear', slotFlex: 5 },
] as const;

export type SlotCategory = (typeof SLOTS)[number]['category'];
export type SlotIndices = Record<SlotCategory, number>;

export const CAT_TO_SLOT: Record<string, SlotCategory> = {
  [Category.TOPS]: Category.TOPS,
  [Category.OUTERWEAR]: Category.TOPS,
  [Category.BOTTOMS]: Category.BOTTOMS,
  [Category.SHOES]: Category.SHOES,
};

const SLOT_CATEGORIES = new Set<string>([Category.TOPS, Category.BOTTOMS, Category.SHOES]);

export const SUB_TO_CAT: Record<string, SlotCategory> = {};
for (const [cat, subs] of Object.entries(SUBCATEGORIES)) {
  const slotCat = CAT_TO_SLOT[cat];
  if (SLOT_CATEGORIES.has(cat) || slotCat) {
    for (const sub of subs) {
      SUB_TO_CAT[sub.toLowerCase()] = slotCat ?? (cat as SlotCategory);
    }
  }
}

export const SLOT_SUBCATEGORIES: Record<SlotCategory, string[]> = {
  [Category.TOPS]: [...SUBCATEGORIES[Category.TOPS], ...SUBCATEGORIES[Category.OUTERWEAR]].sort(),
  [Category.BOTTOMS]: [...SUBCATEGORIES[Category.BOTTOMS]].sort(),
  [Category.SHOES]: [...SUBCATEGORIES[Category.SHOES]].sort(),
};
