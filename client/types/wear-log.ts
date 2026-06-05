export type WearLogItem = {
  id: string;
  item_name: string | null;
  image_url: string | null;
};

export type DayWearEntry = {
  wearLogId: string;
  outfitId: string;
  wornOn: string;
  items: WearLogItem[];
};
