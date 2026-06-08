// [GenAI Use] Prompt: import necessary libraries and components for defining avatar slot configuration and building category-to-slot and subcategory-to-slot lookup maps.
// [GenAI Use] Reflection: i traced how SUBCATEGORIES feeds into SUB_TO_CAT and understood why the mapping is built at module load time rather than at runtime
import { Category, SUBCATEGORIES } from '@/constants/categories';

export const SLOTS = [
  { label: 'Top', category: Category.TOPS, slot: 'top', slotFlex: 9 },
  { label: 'Bottom', category: Category.BOTTOMS, slot: 'bottom', slotFlex: 9 },
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

// [GenAI Use] Prompt: "Map subcategories back to their main outfit slots. Group combined categories 
// (like outerwear into tops) automatically, and ignore anything that isn't part of the outfit layout."
// [GenAI Use] LLM Response Start
export const SUB_TO_CAT: Record<string, SlotCategory> = {};
for (const [cat, subs] of Object.entries(SUBCATEGORIES)) {
  const slotCat = CAT_TO_SLOT[cat];
  if (SLOT_CATEGORIES.has(cat) || slotCat) {
    for (const sub of subs) {
      SUB_TO_CAT[sub.toLowerCase()] = slotCat ?? (cat as SlotCategory);
    }
  }
}
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection: the loop worked well. i confirmed the fallback handles categories
// that map directly without going through the remapping step.

export const SLOT_SUBCATEGORIES: Record<SlotCategory, string[]> = {
  [Category.TOPS]: [...SUBCATEGORIES[Category.TOPS], ...SUBCATEGORIES[Category.OUTERWEAR]].sort(),
  [Category.BOTTOMS]: [...SUBCATEGORIES[Category.BOTTOMS]].sort(),
  [Category.SHOES]: [...SUBCATEGORIES[Category.SHOES]].sort(),
};
