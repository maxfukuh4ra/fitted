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
