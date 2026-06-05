export enum Category {
  OUTERWEAR = 'outerwear',
  TOPS = 'tops',
  BOTTOMS = 'bottoms',
  SHOES = 'shoes',
  ACCESSORIES = 'accessories',
}

export const CATEGORY_LABELS: Record<Category, string> = {
  [Category.OUTERWEAR]: 'Outerwear',
  [Category.TOPS]: 'Tops',
  [Category.BOTTOMS]: 'Bottoms',
  [Category.SHOES]: 'Shoes',
  [Category.ACCESSORIES]: 'Accessories',
};

export const SUBCATEGORIES: Record<Category, string[]> = {
  [Category.OUTERWEAR]: ['Hoodie', 'Zip-up', 'Coat', 'Jacket'],
  [Category.TOPS]:      ['T-Shirt', 'Shirt', 'Sweater', 'Tank Top'],
  [Category.BOTTOMS]:   ['Jeans', 'Trousers', 'Shorts', 'Skirt'],
  [Category.SHOES]:     ['Sneakers', 'Boots', 'Loafers', 'Sandals'],
  [Category.ACCESSORIES]: ['Coming Soon'],
};