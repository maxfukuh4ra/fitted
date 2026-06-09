import { supabase } from './supabase';
import { CLOSET_ITEM_SELECT } from './items';
import type { ClosetItem } from './types/closet';

export type Collection = {
  id: string;
  user_id: string;
  name: string;
  is_favorite: boolean;
  outfit_count: number;
  item_count: number;
  thumbnail_urls: string[];
};

export type CollectionOutfit = {
  id: string;
  name: string | null;
  items: { slot: string | null; item: ClosetItem }[];
  thumbnail_urls: string[];
};

export type CollectionDetail = Collection & {
  outfits: CollectionOutfit[];
  items: ClosetItem[];
};

// avatar-saved outfits have slots; items added directly go in a bucket outfit with no slot
function hasSlots(outfit: { outfit_items?: { slot?: string | null }[] }) {
  return (outfit.outfit_items ?? []).some((oi) => oi.slot);
}

function getOutfitsFromRow(link: { outfits?: unknown }) {
  if (!link.outfits) return [];
  return Array.isArray(link.outfits) ? link.outfits : [link.outfits];
}

function mapCollectionItems(row: {
  collection_outfits?: { outfits?: unknown }[];
}): ClosetItem[] {
  const items: ClosetItem[] = [];
  const seenIds = new Set<string>();

  for (const link of row.collection_outfits ?? []) {
    for (const outfit of getOutfitsFromRow(link) as { outfit_items?: { items?: ClosetItem | null }[] }[]) {
      for (const outfitItem of outfit.outfit_items ?? []) {
        const item = outfitItem.items;
        if (item && !seenIds.has(item.id)) {
          seenIds.add(item.id);
          items.push(item);
        }
      }
    }
  }

  return items;
}

function mapCollectionOutfits(row: {
  collection_outfits?: { outfits?: unknown }[];
}): CollectionOutfit[] {
  const outfits: CollectionOutfit[] = [];

  for (const link of row.collection_outfits ?? []) {
    for (const outfit of getOutfitsFromRow(link) as {
      id: string;
      name: string | null;
      outfit_items?: { slot?: string | null; items?: ClosetItem | null }[];
    }[]) {
      if (!hasSlots(outfit)) continue;

      const items = (outfit.outfit_items ?? [])
        .filter((oi) => oi.items)
        .map((oi) => ({
          slot: oi.slot ?? null,
          item: oi.items as ClosetItem,
        }));

      const thumbnailUrls: string[] = [];
      for (const { item } of items) {
        if (item.image_url && thumbnailUrls.length < 4) {
          thumbnailUrls.push(item.image_url);
        }
      }

      outfits.push({
        id: outfit.id,
        name: outfit.name,
        items,
        thumbnail_urls: thumbnailUrls,
      });
    }
  }

  return outfits;
}

function mapCollectionRow(row: {
  id: string;
  user_id: string;
  name: string;
  is_favorite: boolean;
  collection_outfits?: { outfits?: unknown }[];
}): Collection {
  const seenItemIds = new Set<string>();
  const imageUrls: string[] = [];
  let outfitCount = 0;

  for (const link of row.collection_outfits ?? []) {
    for (const outfit of getOutfitsFromRow(link) as {
      outfit_items?: { slot?: string | null; item_id?: string; items?: { id?: string; image_url?: string | null } | null }[];
    }[]) {
      if (hasSlots(outfit)) {
        outfitCount += 1;
      }

      for (const outfitItem of outfit.outfit_items ?? []) {
        const itemId = outfitItem.item_id ?? outfitItem.items?.id;
        if (!itemId || seenItemIds.has(itemId)) continue;

        seenItemIds.add(itemId);
        const url = outfitItem.items?.image_url;
        if (url && imageUrls.length < 4) {
          imageUrls.push(url);
        }
      }
    }
  }

  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    is_favorite: row.is_favorite,
    outfit_count: outfitCount,
    item_count: seenItemIds.size,
    thumbnail_urls: imageUrls,
  };
}

async function getBucketOutfitId(collectionId: string): Promise<string | null> {
  const outfitIds = await getCollectionOutfitIds(collectionId);
  if (outfitIds.length === 0) return null;

  const { data, error } = await supabase
    .from('outfit_items')
    .select('outfit_id, slot')
    .in('outfit_id', outfitIds);

  if (error) throw new Error(error.message);

  const savedOutfitIds = new Set(
    (data ?? []).filter((row) => row.slot).map((row) => row.outfit_id),
  );

  return outfitIds.find((id) => !savedOutfitIds.has(id)) ?? null;
}

export async function fetchCollections(userId: string) {
  const { data, error } = await supabase
    .from('collections')
    .select(
      'id, user_id, name, is_favorite, collection_outfits(outfits(id, outfit_items(slot, item_id, items(image_url))))',
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  return (data || []).map((row: any) => mapCollectionRow(row)) as Collection[];
}

export async function fetchCollectionDetail(collectionId: string): Promise<CollectionDetail> {
  const { data, error } = await supabase
    .from('collections')
    .select(
      `id, user_id, name, is_favorite, collection_outfits(outfits(id, name, outfit_items(slot, item_id, items(${CLOSET_ITEM_SELECT}))))`,
    )
    .eq('id', collectionId)
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Collection not found.');

  const collection = mapCollectionRow(data);
  const items = mapCollectionItems(data);
  const outfits = mapCollectionOutfits(data);

  return { ...collection, items, outfits };
}

async function getCollectionOutfitIds(collectionId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('collection_outfits')
    .select('outfit_id')
    .eq('collection_id', collectionId);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => row.outfit_id);
}

export async function addOutfitToCollections(outfitId: string, collectionIds: string[]) {
  if (collectionIds.length === 0) return;

  const links = collectionIds.map((collectionId) => ({
    collection_id: collectionId,
    outfit_id: outfitId,
  }));

  const { error } = await supabase.from('collection_outfits').insert(links);
  if (error) throw new Error(error.message);
}

export async function removeOutfitFromCollection(collectionId: string, outfitId: string) {
  const { error } = await supabase
    .from('collection_outfits')
    .delete()
    .eq('collection_id', collectionId)
    .eq('outfit_id', outfitId);

  if (error) throw new Error(error.message);
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

  let outfitId = await getBucketOutfitId(collectionId);

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

  const { data: existingItems, error: existingError } = await supabase
    .from('outfit_items')
    .select('item_id')
    .eq('outfit_id', outfitId);

  if (existingError) throw new Error(existingError.message);

  const existingIds = new Set((existingItems ?? []).map((row) => row.item_id));
  const newItemIds = itemIds.filter((id) => !existingIds.has(id));
  if (newItemIds.length === 0) return;

  const outfitItems = newItemIds.map((itemId) => ({
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

  const { data: slotRows, error: slotError } = await supabase
    .from('outfit_items')
    .select('outfit_id, slot')
    .in('outfit_id', outfitIds);

  if (slotError) throw new Error(slotError.message);

  const savedOutfitIds = new Set(
    (slotRows ?? []).filter((row) => row.slot).map((row) => row.outfit_id),
  );
  const bucketOutfitIds = outfitIds.filter((id) => !savedOutfitIds.has(id));

  const { error: linksError } = await supabase
    .from('collection_outfits')
    .delete()
    .eq('collection_id', collectionId);

  if (linksError) throw new Error(linksError.message);

  if (bucketOutfitIds.length > 0) {
    const { error: outfitItemsError } = await supabase
      .from('outfit_items')
      .delete()
      .in('outfit_id', bucketOutfitIds);

    if (outfitItemsError) throw new Error(outfitItemsError.message);

    const { error: outfitsError } = await supabase
      .from('outfits')
      .delete()
      .in('id', bucketOutfitIds);

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

  return {
    ...collection,
    outfit_count: 0,
    item_count: itemCount,
    thumbnail_urls: thumbnailUrls,
  } as Collection;
}
