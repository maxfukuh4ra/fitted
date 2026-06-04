import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Palette, Radius, Spacing, Typography } from "@/constants/design";
import { formatSubcategoryLabel } from "@/lib/closet-filters";
import type { ClosetItem } from "@/lib/types/closet";

type Props = {
  item: ClosetItem;
  selected: boolean;
  onPress: () => void;
};

function getTitle(item: ClosetItem) {
  const name = item.item_name?.trim();
  if (name) return name;
  return formatSubcategoryLabel(item.subcategory);
}

export function SelectableClosetCard({ item, selected, onPress }: Props) {
  const title = getTitle(item);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={styles.imageWrap}>
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.image}
            contentFit="contain"
          />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: Palette.surfaceContainerLowest,
    overflow: "hidden",
  },
  cardSelected: {
    borderColor: Palette.primary,
  },
  imageWrap: {
    aspectRatio: 3 / 4,
    backgroundColor: Palette.surfaceContainerLow,
    padding: Spacing.stackSm,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "60%",
    height: "60%",
    borderRadius: Radius.md,
    backgroundColor: Palette.surfaceVariant,
  },
  title: {
    ...Typography.bodyMd,
    color: Palette.onSurface,
    padding: 12,
  },
});
