import { Image } from "expo-image";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

import { styles } from "@/components/calendar/calendar-styles";
import { Palette } from "@/constants/design";
import type { WearLogItem } from "@/types/wear-log";

export function DayWearCarousel({
  dateLabel,
  items,
  loading,
}: {
  dateLabel: string;
  items: WearLogItem[];
  loading: boolean;
}) {
  return (
    <View style={styles.dayWearSection}>
      <Text style={styles.dayWearTitle}>{dateLabel}</Text>
      <Text style={styles.dayWearSubtitle}>WHAT YOU WORE</Text>
      {loading ? (
        <View style={styles.dayWearLoading}>
          <ActivityIndicator color={Palette.primary} size="small" />
        </View>
      ) : items.length > 0 ? (
        <FlatList
          horizontal
          data={items}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          style={styles.dayWearCarousel}
          contentContainerStyle={styles.dayWearCarouselContent}
          ItemSeparatorComponent={() => <View style={styles.dayWearSeparator} />}
          renderItem={({ item }) => {
            const title = item.item_name?.trim() || "Untitled item";
            return (
              <View style={styles.dayWearCard}>
                <View style={styles.dayWearImageWrap}>
                  {item.image_url ? (
                    <Image
                      source={{ uri: item.image_url }}
                      style={styles.dayWearImage}
                      contentFit="contain"
                    />
                  ) : (
                    <View style={styles.dayWearPlaceholder} />
                  )}
                </View>
                <Text style={styles.dayWearCardTitle} numberOfLines={2}>
                  {title}
                </Text>
              </View>
            );
          }}
        />
      ) : null}
    </View>
  );
}
