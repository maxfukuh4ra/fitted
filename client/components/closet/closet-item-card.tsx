// Card for each item in the closet
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { formatCategoryLabel } from '@/lib/closet-filters';
import type { ClosetItem } from '@/lib/types/closet';
import { Palette, Radius, Spacing, Typography } from '@/constants/design';

type ClosetItemCardProps = {
  item: ClosetItem;
};

export function ClosetItemCard({ item }: ClosetItemCardProps) {
  const label = formatCategoryLabel(item.category);

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.image}
            contentFit="contain"
            accessibilityLabel={label}
          />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {label}
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
  },
  title: {
    ...Typography.bodyMd,
    color: Palette.onSurface,
  },
});
