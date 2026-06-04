import { supabase } from "./supabase";

export type Friend = {
  friendshipId: string;
  userId: string;
  name: string;
  email?: string;
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

async function fetchUsersInfo(
  ids: string[],
): Promise<Record<string, { id: string; name: string; email: string }>> {
  if (ids.length === 0) return {};
  const { data, error } = await supabase.rpc("get_users_info", {
    user_ids: ids,
  });
  if (error) throw new Error(error.message);
  return Object.fromEntries(
    (data ?? []).map((p: { id: string; name: string; email: string }) => [
      p.id,
      p,
    ]),
  );
}

async function deleteFriendship(friendshipId: string): Promise<void> {
  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);
  if (error) throw new Error(error.message);
}

export async function sendFriendRequest(email: string): Promise<void> {
  const { data, error } = await supabase.rpc("find_user_by_email", {
    search_email: email.trim(),
  });
  if (error) throw new Error(error.message);
  if (!data || data.length === 0)
    throw new Error("No user found with that email.");

  const uid = await getCurrentUserId();
  const targetId = data[0].id;

  const { data: existing } = await supabase
    .from("friendships")
    .select("status")
    .or(
      `and(requester_id.eq.${uid},addressee_id.eq.${targetId}),and(requester_id.eq.${targetId},addressee_id.eq.${uid})`,
    )
    .maybeSingle();

  if (existing) {
    if (existing.status === "accepted") throw new Error("Already friends.");
    throw new Error("Friend request already pending.");
  }

  const { error: insertError } = await supabase
    .from("friendships")
    .insert([{ requester_id: uid, addressee_id: targetId, status: "pending" }]);

  if (insertError) {
    if (insertError.code === "23505")
      throw new Error("Already friends or request already pending.");
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

export const declineFriendRequest = deleteFriendship;
export const removeFriend = deleteFriendship;

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
  const infoMap = await fetchUsersInfo(friendIds);

  return data.map((f) => {
    const friendId = f.requester_id === uid ? f.addressee_id : f.requester_id;
    return {
      friendshipId: f.id,
      userId: friendId,
      name: infoMap[friendId]?.name ?? "Unknown",
      email: infoMap[friendId]?.email,
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

  const infoMap = await fetchUsersInfo(data.map((f) => f.requester_id));

  return data.map((f) => ({
    friendshipId: f.id,
    userId: f.requester_id,
    name: infoMap[f.requester_id]?.name ?? "Unknown",
    email: infoMap[f.requester_id]?.email,
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
    .in("visibility", ["Public", "Friends"])
    .order("created_at", { ascending: false });

  if (outfitError) throw new Error(outfitError.message);
  if (!outfits || outfits.length === 0) return [];

  const infoMap = await fetchUsersInfo(friendIds);

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
    userName: infoMap[o.user_id]?.name ?? "Unknown",
    createdAt: o.created_at,
    items: itemsByOutfit[o.id] ?? [],
  }));
}
