import { supabase } from './supabase';

export type Collection = {
  id: string;
  user_id: string;
  name: string;
  is_favorite: boolean;
  outfit_count: number;
};

export async function fetchCollections(userId: string) {
  const { data, error } = await supabase
    .from('collections')
    .select('id, user_id, name, is_favorite, collection_outfits(count)')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    is_favorite: row.is_favorite,
    outfit_count: row.collection_outfits?.[0]?.count ?? 0,
  })) as Collection[];
}

export async function createCollection(userId: string, name: string) {
  if (!name.trim()) {
    throw new Error('Collection name is required.');
  }

  const { data, error } = await supabase
    .from('collections')
    .insert({
      user_id: userId,
      name: name.trim(),
      is_favorite: false,
    })
    .select('id, user_id, name, is_favorite')
    .single();

  if (error) throw error;

  return { ...data, outfit_count: 0 } as Collection;
}
