import { supabase } from './supabase';

export type Collection = {
  id: string;
  user_id: string;
  name: string;
  is_favorite: boolean;
};

export async function fetchCollections(userId: string) {
  const { data, error } = await supabase
    .from('collections')
    .select('id, user_id, name, is_favorite')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) throw error;

  return (data || []) as Collection[];
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

  return data as Collection;
}
