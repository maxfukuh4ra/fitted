import { Image } from "expo-image";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Palette, Radius, Spacing, Typography } from "@/constants/design";

type ClosetItemCardProps = {
  id: string;
  name?: string;
  category?: string;
  subcategory?: string;
  imageUrl?: string;
  style?: StyleProp<ViewStyle>;
};

export function ClosetItemCard({
  id,
  name,
  category,
  subcategory,
  imageUrl,
  style,
}: ClosetItemCardProps) {
  const displayName = name || subcategory || category || "Unnamed item";

  return (
    <View style={[styles.card, style]}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>No image</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {displayName}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.surfaceContainerLowest,
    borderRadius: Radius.md,
    overflow: "hidden",
    marginBottom: Spacing.stackMd,
  },
  image: {
    width: "100%",
    height: 200,
    backgroundColor: Palette.surfaceContainerHigh,
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: Palette.surfaceContainerHigh,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
  },
  content: {
    padding: Spacing.stackMd,
  },
  title: {
    ...Typography.titleLg,
    color: Palette.onSurface,
  },
});
