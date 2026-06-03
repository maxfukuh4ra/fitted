// Functions to fetch and filter items used in closet and avatar screens
import { supabase } from '@/lib/supabase';
import type { AvatarItem, ClosetItem } from '@/lib/types/closet';

// Selects for closet items
export const CLOSET_ITEM_SELECT =
  'id, user_id, category, subcategory, image_url, created_at' as const;
// Selects for avatar items
export const AVATAR_ITEM_SELECT = 'id, image_url, category' as const;

async function fetchUserItems<T>(userId: string, select: string): Promise<T[]> {
  const { data, error } = await supabase
    .from('items')
    .select(select)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as T[];
}

export function fetchClosetItems(userId: string): Promise<ClosetItem[]> {
  return fetchUserItems<ClosetItem>(userId, CLOSET_ITEM_SELECT);
}

export function fetchAvatarItems(userId: string): Promise<AvatarItem[]> {
  return fetchUserItems<AvatarItem>(userId, AVATAR_ITEM_SELECT);
}
