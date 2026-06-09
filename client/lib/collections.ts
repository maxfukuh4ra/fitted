import { supabase } from './supabase';
import { CLOSET_ITEM_SELECT } from './items';
import type { ClosetItem } from './types/closet';

export type Collection = {
  id: string;
  user_id: string;
  name: string;
  is_favorite: boolean;
  item_count: number;
  thumbnail_urls: string[];
};

export type CollectionDetail = Collection & {
  items: ClosetItem[];
};

function mapCollectionItems(row: {
  collection_outfits?: {
    outfits?: {
      outfit_items?: { items?: ClosetItem | null }[];
    } | null;
  }[];
}): ClosetItem[] {
  const items: ClosetItem[] = [];
  const seenIds = new Set<string>();

  for (const link of row.collection_outfits ?? []) {
    for (const outfitItem of link.outfits?.outfit_items ?? []) {
      const item = outfitItem.items;
      if (item && !seenIds.has(item.id)) {
        seenIds.add(item.id);
        items.push(item);
      }
    }
  }

  return items;
}

function mapCollectionRow(row: {
  id: string;
  user_id: string;
  name: string;
  is_favorite: boolean;
  collection_outfits?: {
    outfits?: {
      outfit_items?: { items?: { image_url?: string | null } | null }[];
    } | null;
  }[];
}): Collection {
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
}

export async function fetchCollections(userId: string) {
  const { data, error } = await supabase
    .from('collections')
    .select(
      'id, user_id, name, is_favorite, collection_outfits(outfits(outfit_items(items(image_url))))',
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((row: any) => mapCollectionRow(row)) as Collection[];
}

export async function fetchCollectionDetail(collectionId: string): Promise<CollectionDetail> {
  const { data, error } = await supabase
    .from('collections')
    .select(
      `id, user_id, name, is_favorite, collection_outfits(outfits(outfit_items(items(${CLOSET_ITEM_SELECT}))))`,
    )
    .eq('id', collectionId)
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Collection not found.');

  const collection = mapCollectionRow(data);
  const items = mapCollectionItems(data);

  return { ...collection, items };
}

async function getCollectionOutfitIds(collectionId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('collection_outfits')
    .select('outfit_id')
    .eq('collection_id', collectionId);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => row.outfit_id);
}

export async function removeItemFromCollection(collectionId: string, itemId: string) {
  const outfitIds = await getCollectionOutfitIds(collectionId);
  if (outfitIds.length === 0) return;

  const { error } = await supabase
    .from('outfit_items')
    .delete()
    .eq('item_id', itemId)
    .in('outfit_id', outfitIds);

  if (error) throw new Error(error.message);
}

export async function addItemsToCollection(
  collectionId: string,
  userId: string,
  collectionName: string,
  itemIds: string[],
) {
  if (itemIds.length === 0) return;

  let outfitIds = await getCollectionOutfitIds(collectionId);
  let outfitId = outfitIds[0];

  if (!outfitId) {
    const { data: outfitData, error: outfitError } = await supabase
      .from('outfits')
      .insert([{ user_id: userId, name: collectionName.trim() }])
      .select('id');

    if (outfitError) throw new Error(outfitError.message);

    outfitId = outfitData?.[0]?.id;
    if (!outfitId) {
      throw new Error('Failed to create outfit.');
    }

    const { error: linkError } = await supabase.from('collection_outfits').insert({
      collection_id: collectionId,
      outfit_id: outfitId,
    });

    if (linkError) throw new Error(linkError.message);
  }

  const outfitItems = itemIds.map((itemId) => ({
    outfit_id: outfitId,
    item_id: itemId,
  }));

  const { error: outfitItemsError } = await supabase
    .from('outfit_items')
    .insert(outfitItems);

  if (outfitItemsError) throw new Error(outfitItemsError.message);
}

export async function deleteCollection(collectionId: string) {
  const outfitIds = await getCollectionOutfitIds(collectionId);

  const { error: linksError } = await supabase
    .from('collection_outfits')
    .delete()
    .eq('collection_id', collectionId);

  if (linksError) throw new Error(linksError.message);

  if (outfitIds.length > 0) {
    const { error: outfitItemsError } = await supabase
      .from('outfit_items')
      .delete()
      .in('outfit_id', outfitIds);

    if (outfitItemsError) throw new Error(outfitItemsError.message);

    const { error: outfitsError } = await supabase
      .from('outfits')
      .delete()
      .in('id', outfitIds);

    if (outfitsError) throw new Error(outfitsError.message);
  }

  const { error } = await supabase.from('collections').delete().eq('id', collectionId);

  if (error) throw new Error(error.message);
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
