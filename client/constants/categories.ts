export enum Category {
  Outerwear = "Outerwear",
  Tops = "Tops",
  Bottoms = "Bottoms",
  Shoes = "Shoes",
  Accessories = "Accessories",
}

export const SUBCATEGORIES: Record<Category, string[]> = {
  [Category.Outerwear]: ["Hoodie", "Zip-up", "Coat", "Jacket"],
  [Category.Tops]: ["T-Shirt", "Shirt", "Sweater", "Tank Top"],
  [Category.Bottoms]: ["Jeans", "Trousers", "Shorts", "Skirt"],
  [Category.Shoes]: ["Sneakers", "Boots", "Loafers", "Sandals"],
  [Category.Accessories]: ["Coming Soon"],
};
