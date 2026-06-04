import { supabase } from "./supabase";
import type { DayWearEntry, WearLogItem } from "@/types/wear-log";

export function formatWornOn(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

async function getUserId() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  if (!data.session) throw new Error("No active session.");
  return data.session.user.id;
}

export async function loadDayWears(
  year: number,
  month: number,
  day: number,
): Promise<DayWearEntry[]> {
  const userId = await getUserId();
  const wornOn = formatWornOn(year, month, day);

  const { data, error } = await supabase
    .from("wear_log")
    .select(
      "id, worn_on, outfit_id, outfits ( outfit_items ( items ( id, item_name, image_url ) ) )",
    )
    .eq("user_id", userId)
    .eq("worn_on", wornOn);

  if (error) throw new Error(error.message);

  const entries: DayWearEntry[] = [];
  for (const row of data ?? []) {
    const items: WearLogItem[] = [];
    const outfit = row.outfits as {
      outfit_items?: { items: WearLogItem | null }[];
    } | null;

    for (const link of outfit?.outfit_items ?? []) {
      if (link.items) items.push(link.items);
    }

    entries.push({
      wearLogId: row.id,
      outfitId: row.outfit_id,
      wornOn: String(row.worn_on),
      items,
    });
  }

  return entries;
}

export async function recordWear(
  wornOn: string,
  itemIds: string[],
): Promise<{ outfitId: string; wearLogId: string }> {
  if (itemIds.length === 0) {
    throw new Error("Pick at least one item.");
  }

  const userId = await getUserId();

  const { data: owned, error: checkError } = await supabase
    .from("items")
    .select("id")
    .eq("user_id", userId)
    .in("id", itemIds);

  if (checkError) throw new Error(checkError.message);
  if ((owned ?? []).length !== itemIds.length) {
    throw new Error("Some items weren't found in your closet.");
  }

  const { data: outfit, error: outfitError } = await supabase
    .from("outfits")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (outfitError) throw new Error(outfitError.message);

  const { error: linkError } = await supabase.from("outfit_items").insert(
    itemIds.map((item_id) => ({ outfit_id: outfit.id, item_id })),
  );

  if (linkError) throw new Error(linkError.message);

  const { data: log, error: logError } = await supabase
    .from("wear_log")
    .insert({
      user_id: userId,
      outfit_id: outfit.id,
      worn_on: wornOn,
    })
    .select("id")
    .single();

  if (logError) throw new Error(logError.message);

  return { outfitId: outfit.id, wearLogId: log.id };
}
