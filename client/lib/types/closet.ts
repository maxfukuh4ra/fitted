// Full closet item 
export type ClosetItem = {
  id: string;
  user_id: string | null;
  category: string | null;
  subcategory: string | null;
  item_name: string | null;
  image_url: string | null;
  created_at: string;
};

// Just image and category for avatar wardrobe
export type AvatarItem = {
  id: string;
  image_url: string | null;
  category: string | null;
};

export type CategoryFilter = {
  value: string | null; // null on all items
  label: string;
};
