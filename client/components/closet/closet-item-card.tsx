import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { formatSubcategoryLabel } from '@/lib/closet-filters';
import type { ClosetItem } from '@/lib/types/closet';
import { Palette, Radius, Spacing, Typography } from '@/constants/design';

type ClosetItemCardProps = {
  item: ClosetItem;
};

function getItemDisplayName(item: ClosetItem): string {
  const name = item.item_name?.trim();
  if (name) {
    return name;
  }
  return formatSubcategoryLabel(item.subcategory);
}

export function ClosetItemCard({ item }: ClosetItemCardProps) {
  const title = getItemDisplayName(item);
  const subcategoryLabel = formatSubcategoryLabel(item.subcategory);

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.image}
            contentFit="contain"
            accessibilityLabel={title}
          />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subcategoryLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Palette.surfaceContainerLowest,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 24,
    elevation: 2,
  },
  imageContainer: {
    aspectRatio: 3 / 4,
    backgroundColor: Palette.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.containerMargin,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '60%',
    height: '60%',
    borderRadius: Radius.md,
    backgroundColor: Palette.surfaceVariant,
  },
  textBlock: {
    padding: 12,
    gap: 4,
  },
  title: {
    ...Typography.bodyMd,
    color: Palette.onSurface,
  },
  subtitle: {
    ...Typography.labelSm,
    color: Palette.onSurfaceVariant,
    textTransform: 'none',
    letterSpacing: 0.2,
  },
});
