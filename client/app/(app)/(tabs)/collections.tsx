import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette, Radius, Spacing, Typography } from '@/constants/design';
import { type Collection } from '@/lib/collections';

const DUMMY_USER_ID = 'demo-user';
const DUMMY_COLLECTIONS: Collection[] = [
  {
    id: 'demo-collection-1',
    user_id: DUMMY_USER_ID,
    name: 'Gym',
    is_favorite: false,
  },
  {
    id: 'demo-collection-2',
    user_id: DUMMY_USER_ID,
    name: 'School',
    is_favorite: false,
  },
];
const DUMMY_ITEM_COUNTS: Record<string, number> = {
  'demo-collection-1': 12,
  'demo-collection-2': 8,
};

function getCollectionItemCount(collection: Collection) {
  return DUMMY_ITEM_COUNTS[collection.id] ?? 0;
}

export default function CollectionsScreen() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function loadCollections() {
    setIsLoading(true);
    setCollections(DUMMY_COLLECTIONS);
    setIsLoading(false);
  }

  useEffect(() => {
    loadCollections();
  }, []);

  function handleCreateCollection() {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setCollections((prev) =>
      [
        ...prev,
        {
          id: `demo-collection-${prev.length + 1}`,
          user_id: DUMMY_USER_ID,
          name: `New collection ${prev.length + 1}`,
          is_favorite: false,
        },
      ].sort((a, b) => a.name.localeCompare(b.name))
    );
    setIsSubmitting(false);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <Text style={styles.title}>Collections</Text>
        <Text style={styles.description}>
          Organize your wardrobe into curated selections for any occasion, season, or mood.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create collection"
          onPress={() => void handleCreateCollection()}
          style={({ pressed }) => [
            styles.createButton,
            { opacity: isSubmitting ? 0.6 : pressed ? 0.85 : 1 },
          ]}>
          {isSubmitting ? (
            <ActivityIndicator size="small" color={Palette.onPrimary} />
          ) : (
            <>
              <MaterialIcons name="add" size={20} color={Palette.onPrimary} />
              <Text style={styles.createButtonLabel}>Create collection</Text>
            </>
          )}
        </Pressable>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Palette.primary} />
            <Text style={styles.infoText}>Loading collections...</Text>
          </View>
        ) : (
          <FlatList
            key="collections-grid-2"
            data={collections}
            keyExtractor={(item) => item.id}
            numColumns={2}
            style={styles.collectionsList}
            contentContainerStyle={[
              styles.listContent,
              collections.length === 0 && styles.listContentEmpty,
            ]}
            columnWrapperStyle={collections.length > 1 ? styles.listRow : undefined}
            ListEmptyComponent={
              <Text style={styles.infoText}>No collections yet. Create your first one.</Text>
            }
            renderItem={({ item }) => (
              <View style={styles.collectionItem}>
                <View
                  style={styles.collectionImage}
                  accessibilityLabel={`${item.name} collection image`}
                />
                <View style={styles.collectionTextBlock}>
                  <Text style={styles.collectionName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.collectionMeta}>
                    {getCollectionItemCount(item)} items
                  </Text>
                </View>
              </View>
            )}
            onRefresh={loadCollections}
            refreshing={isLoading}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  screen: {
    flex: 1,
    backgroundColor: Palette.background,
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.containerMargin,
  },
  title: {
    ...Typography.headlineMd,
    color: Palette.onSurface,
  },
  description: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
    marginTop: Spacing.stackSm,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.stackSm,
    marginTop: Spacing.stackMd,
    paddingVertical: 14,
    paddingHorizontal: Spacing.stackMd,
    borderRadius: Radius.lg,
    backgroundColor: Palette.primary,
  },
  createButtonLabel: {
    ...Typography.titleLg,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
    color: Palette.onPrimary,
  },
  loadingContainer: {
    marginTop: Spacing.stackMd,
    alignItems: 'center',
    gap: Spacing.stackSm,
  },
  collectionsList: {
    marginHorizontal: -Spacing.containerMargin,
  },
  listContent: {
    marginTop: Spacing.stackMd,
    paddingHorizontal: Spacing.containerMargin,
    paddingBottom: Spacing.stackLg,
    gap: Spacing.stackSm,
  },
  listRow: {
    justifyContent: 'space-between',
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  collectionItem: {
    width: '48%',
    borderRadius: Radius.lg,
    backgroundColor: Palette.background,
    paddingTop: Spacing.stackSm,
  },
  collectionImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.md,
    backgroundColor: Palette.surfaceVariant,
  },
  collectionTextBlock: {
    paddingHorizontal: Spacing.stackSm,
    paddingTop: 6,
    paddingBottom: Spacing.stackSm,
    gap: 1,
  },
  collectionName: {
    ...Typography.bodyMd,
    fontWeight: '600',
    color: Palette.onSurface,
  },
  collectionMeta: {
    ...Typography.bodyMd,
    fontSize: 13,
    lineHeight: 18,
    color: Palette.onSurfaceVariant,
  },
  infoText: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
    textAlign: 'center',
    marginTop: Spacing.stackMd,
  },
});
