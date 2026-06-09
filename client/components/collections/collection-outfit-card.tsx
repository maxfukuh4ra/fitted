import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Palette, Radius, Spacing, Typography } from '@/constants/design';
import type { CollectionOutfit } from '@/lib/collections';

type Props = {
  outfit: CollectionOutfit;
};

// copied thumbnail layout from collections list page
export function CollectionOutfitCard({ outfit }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.collectionImage}>
        {[0, 1, 2, 3].map((index) => {
          const imageUrl = outfit.thumbnail_urls[index];
          return (
            <View key={index} style={styles.collectionImageCell}>
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.collectionThumbnail}
                  contentFit="cover"
                />
              ) : null}
            </View>
          );
        })}
      </View>
      <Text style={styles.collectionName} numberOfLines={1}>
        {outfit.name?.trim() || 'Untitled outfit'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  collectionImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(196, 199, 199, 0.55)',
    backgroundColor: Palette.surfaceVariant,
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
  collectionImageCell: {
    width: '50%',
    height: '50%',
    backgroundColor: Palette.surfaceVariant,
  },
  collectionThumbnail: {
    width: '100%',
    height: '100%',
  },
  collectionName: {
    ...Typography.bodyMd,
    fontWeight: '600',
    color: Palette.onSurface,
    paddingTop: 6,
    paddingHorizontal: Spacing.stackSm,
  },
});
