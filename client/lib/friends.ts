import { supabase } from "./supabase";

export type Friend = {
  friendshipId: string;
  userId: string;
  name: string;
  direction: "sent" | "received";
};

export type FriendOutfit = {
  id: string;
  name: string | null;
  userId: string;
  userName: string;
  createdAt: string;
  items: { slot: string; itemId: string; imageUrl: string | null }[];
};

async function getCurrentUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user?.id;
  if (!uid) throw new Error("Not signed in.");
  return uid;
}

export async function sendFriendRequest(email: string): Promise<void> {
  const { data, error } = await supabase.rpc("find_user_by_email", {
    search_email: email.trim(),
  });
  if (error) throw new Error(error.message);
  if (!data || data.length === 0)
    throw new Error("No user found with that email.");

  const uid = await getCurrentUserId();
  const { error: insertError } = await supabase
    .from("friendships")
    .insert([
      { requester_id: uid, addressee_id: data[0].id, status: "pending" },
    ]);

  if (insertError) {
    if (insertError.code === "23505")
      throw new Error("Friend request already sent.");
    throw new Error(insertError.message);
  }
}

export async function acceptFriendRequest(friendshipId: string): Promise<void> {
  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", friendshipId);
  if (error) throw new Error(error.message);
}

export async function declineFriendRequest(
  friendshipId: string,
): Promise<void> {
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);
  if (error) throw new Error(error.message);
}

export async function removeFriend(friendshipId: string): Promise<void> {
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);
  if (error) throw new Error(error.message);
}

async function fetchUserNames(ids: string[]): Promise<Record<string, string>> {
  if (ids.length === 0) return {};
  const { data } = await supabase
    .from("users")
    .select("id, name")
    .in("id", ids);
  return Object.fromEntries((data ?? []).map((p) => [p.id, p.name]));
}

export async function listFriends(): Promise<Friend[]> {
  const uid = await getCurrentUserId();
  const { data, error } = await supabase
    .from("friendships")
    .select("id, requester_id, addressee_id")
    .eq("status", "accepted")
    .or(`requester_id.eq.${uid},addressee_id.eq.${uid}`);

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return [];

  const friendIds = data.map((f) =>
    f.requester_id === uid ? f.addressee_id : f.requester_id,
  );
  const nameMap = await fetchUserNames(friendIds);

  return data.map((f) => {
    const friendId = f.requester_id === uid ? f.addressee_id : f.requester_id;
    return {
      friendshipId: f.id,
      userId: friendId,
      name: nameMap[friendId] ?? "Unknown",
      direction: f.requester_id === uid ? "sent" : "received",
    };
  });
}

export async function getPendingRequests(): Promise<Friend[]> {
  const uid = await getCurrentUserId();
  const { data, error } = await supabase
    .from("friendships")
    .select("id, requester_id")
    .eq("status", "pending")
    .eq("addressee_id", uid);

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return [];

  const nameMap = await fetchUserNames(data.map((f) => f.requester_id));
  return data.map((f) => ({
    friendshipId: f.id,
    userId: f.requester_id,
    name: nameMap[f.requester_id] ?? "Unknown",
    direction: "received" as const,
  }));
}

export async function getFriendsOutfits(): Promise<FriendOutfit[]> {
  const uid = await getCurrentUserId();

  const { data: friendships, error: friendError } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id")
    .eq("status", "accepted")
    .or(`requester_id.eq.${uid},addressee_id.eq.${uid}`);

  if (friendError) throw new Error(friendError.message);
  const friendIds = (friendships ?? []).map((f) =>
    f.requester_id === uid ? f.addressee_id : f.requester_id,
  );
  if (friendIds.length === 0) return [];

  const { data: outfits, error: outfitError } = await supabase
    .from("outfits")
    .select("id, name, user_id, created_at")
    .in("user_id", friendIds)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (outfitError) throw new Error(outfitError.message);
  if (!outfits || outfits.length === 0) return [];

  const nameMap = await fetchUserNames(friendIds);

  const outfitIds = outfits.map((o) => o.id);
  const { data: outfitItems } = await supabase
    .from("outfit_items")
    .select("outfit_id, slot, item_id")
    .in("outfit_id", outfitIds);

  const itemIds = [...new Set((outfitItems ?? []).map((oi) => oi.item_id))];
  let imageMap: Record<string, string | null> = {};
  if (itemIds.length > 0) {
    const { data: items } = await supabase
      .from("items")
      .select("id, image_url")
      .in("id", itemIds);
    imageMap = Object.fromEntries(
      (items ?? []).map((i) => [i.id, i.image_url]),
    );
  }

  const itemsByOutfit: Record<string, FriendOutfit["items"]> = {};
  for (const oi of outfitItems ?? []) {
    if (!itemsByOutfit[oi.outfit_id]) itemsByOutfit[oi.outfit_id] = [];
    itemsByOutfit[oi.outfit_id].push({
      slot: oi.slot,
      itemId: oi.item_id,
      imageUrl: imageMap[oi.item_id] ?? null,
    });
  }

  return outfits.map((o) => ({
    id: o.id,
    name: o.name,
    userId: o.user_id,
    userName: nameMap[o.user_id] ?? "Unknown",
    createdAt: o.created_at,
    items: itemsByOutfit[o.id] ?? [],
  }));
}
