import { supabase } from "./supabase";
import { formatWornOn } from "./wear-log";
import type { WornStatItem } from "@/types/calendar";

export async function loadCalendarMonth(year: number, month: number) {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();
  if (sessionError) throw new Error(sessionError.message);
  if (!sessionData.session) throw new Error("No active session.");

  const userId = sessionData.session.user.id;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const start = formatWornOn(year, month, 1);
  const end = formatWornOn(year, month, lastDay);

  const logsRes = await supabase
    .from("wear_log")
    .select("worn_on")
    .eq("user_id", userId)
    .gte("worn_on", start)
    .lte("worn_on", end);

  if (logsRes.error) throw new Error(logsRes.error.message);

  const outfitDays: number[] = [];
  for (const row of logsRes.data ?? []) {
    const day = parseInt(String(row.worn_on).split("-")[2], 10);
    if (!outfitDays.includes(day)) {
      outfitDays.push(day);
    }
  }
  outfitDays.sort((a, b) => a - b);

  const statsRes = await supabase
    .from("wear_log")
    .select(
      "outfits ( outfit_items ( items ( id, item_name, image_url ) ) )",
    )
    .eq("user_id", userId)
    .gte("worn_on", start)
    .lte("worn_on", end);

  if (statsRes.error) throw new Error(statsRes.error.message);

  const wearCount: Record<
    string,
    { name: string; wears: number; imageUri?: string }
  > = {};

  for (const row of statsRes.data ?? []) {
    const outfit = row.outfits as {
      outfit_items?: { items: { id: string; item_name: string | null; image_url: string | null } | null }[];
    } | null;
    if (!outfit?.outfit_items) continue;

    for (const link of outfit.outfit_items) {
      const item = link.items;
      if (!item) continue;

      if (!wearCount[item.id]) {
        wearCount[item.id] = {
          name: item.item_name || "Untitled item",
          wears: 0,
          imageUri: item.image_url ?? undefined,
        };
      }
      wearCount[item.id].wears += 1;
    }
  }

  const sorted = Object.values(wearCount).sort((a, b) => b.wears - a.wears);
  const stats: WornStatItem[] = [];
  for (let i = 0; i < sorted.length && i < 3; i++) {
    stats.push({
      rank: String(i + 1).padStart(2, "0"),
      name: sorted[i].name,
      wears: sorted[i].wears,
      imageUri: sorted[i].imageUri,
    });
  }

  return { outfitDays, stats };
}
