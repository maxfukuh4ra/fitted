import { supabase } from './supabase';

export type Collection = {
  id: string;
  user_id: string;
  name: string;
  is_favorite: boolean;
  item_count: number;
  thumbnail_urls: string[];
};

export async function fetchCollections(userId: string) {
  const { data, error } = await supabase
    .from('collections')
    .select(
      'id, user_id, name, is_favorite, collection_outfits(outfits(outfit_items(items(image_url))))',
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  return (data || []).map((row: any) => {
    const imageUrls: string[] = [];
    let itemCount = 0;

    for (const link of row.collection_outfits ?? []) {
      for (const outfitItem of link.outfits?.outfit_items ?? []) {
        itemCount += 1;
        const url = outfitItem.items?.image_url;
        if (url && imageUrls.length < 4) {
          imageUrls.push(url);
        }
      }
    }

    return {
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      is_favorite: row.is_favorite,
      item_count: itemCount,
      thumbnail_urls: imageUrls,
    };
  }) as Collection[];
}

export async function createCollection(
  userId: string,
  name: string,
  itemIds: string[] = [],
) {
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
    .select('id, user_id, name, is_favorite');

  if (error) throw new Error(error.message);

  const collection = data?.[0];
  if (!collection) {
    throw new Error('Failed to create collection.');
  }

  let itemCount = 0;
  let thumbnailUrls: string[] = [];

  if (itemIds.length > 0) {
    const { data: outfitData, error: outfitError } = await supabase
      .from('outfits')
      .insert([{ user_id: userId, name: name.trim() }])
      .select('id');

    if (outfitError) throw new Error(outfitError.message);

    const outfitId = outfitData?.[0]?.id;
    if (!outfitId) {
      throw new Error('Failed to create outfit.');
    }

    const outfitItems = itemIds.map((itemId) => ({
      outfit_id: outfitId,
      item_id: itemId,
    }));

    const { error: outfitItemsError } = await supabase
      .from('outfit_items')
      .insert(outfitItems);

    if (outfitItemsError) throw new Error(outfitItemsError.message);

    const { error: linkError } = await supabase.from('collection_outfits').insert({
      collection_id: collection.id,
      outfit_id: outfitId,
    });

    if (linkError) throw new Error(linkError.message);

    itemCount = itemIds.length;

    const { data: itemsData } = await supabase
      .from('items')
      .select('image_url')
      .in('id', itemIds);

    for (const item of itemsData ?? []) {
      if (item.image_url && thumbnailUrls.length < 4) {
        thumbnailUrls.push(item.image_url);
      }
    }
  }

  return { ...collection, item_count: itemCount, thumbnail_urls: thumbnailUrls } as Collection;
}
