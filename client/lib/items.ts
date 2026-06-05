import { supabase } from '@/lib/supabase';
import type { AvatarItem, ClosetItem } from '@/lib/types/closet';

export const CLOSET_ITEM_SELECT =
  'id, user_id, category, subcategory, item_name, image_url, created_at' as const;
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
