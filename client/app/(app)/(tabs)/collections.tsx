import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreateCollectionModal } from '@/components/collections/create-collection-modal';
import { MainHeader } from '@/components/ui/main-header';
import { Palette, Radius, Spacing, Typography } from '@/constants/design';
import { getCurrentUser } from '@/lib/auth';
import { createCollection, fetchCollections, type Collection } from '@/lib/collections';
import { fetchClosetItems } from '@/lib/items';
import type { ClosetItem } from '@/lib/types/closet';

export default function CollectionsScreen() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [closetItems, setClosetItems] = useState<ClosetItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function loadCollections() {
    setIsLoading(true);
    setError(null);
    try {
      const user = await getCurrentUser();
      if (!user) {
        setCollections([]);
        setError('Sign in to view your collections.');
        return;
      }
      const data = await fetchCollections(user.id);
      setCollections(data);
    } catch (e) {
      setCollections([]);
      setError(e instanceof Error ? e.message : 'Failed to load collections.');
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      void loadCollections();
    }, []),
  );

  async function openCreateModal() {
    setCollectionName('');
    setSelectedItemIds(new Set());
    setSaveError(null);
    setModalVisible(true);

    setItemsLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        setSaveError('Sign in to create a collection.');
        setClosetItems([]);
        return;
      }
      const items = await fetchClosetItems(user.id);
      setClosetItems(items);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to load items.');
      setClosetItems([]);
    } finally {
      setItemsLoading(false);
    }
  }

  function toggleItem(itemId: string) {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }

  async function handleSaveCollection() {
    if (saving) return;

    setSaving(true);
    setSaveError(null);
    try {
      const user = await getCurrentUser();
      if (!user) {
        setSaveError('Sign in to create a collection.');
        return;
      }

      const created = await createCollection(
        user.id,
        collectionName,
        [...selectedItemIds],
      );
      setCollections((prev) => [...prev, created]);
      setModalVisible(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to create collection.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <MainHeader />
      <View style={styles.screen}>
        <Text style={styles.title}>Collections</Text>
        <Text style={styles.description}>
          Organize your wardrobe into curated selections for any occasion, season, or mood.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create collection"
          onPress={() => void openCreateModal()}
          style={({ pressed }) => [
            styles.createButton,
            { opacity: pressed ? 0.85 : 1 },
          ]}>
          <MaterialIcons name="add" size={20} color={Palette.onPrimary} />
          <Text style={styles.createButtonLabel}>Create collection</Text>
        </Pressable>

        {error && !isLoading && (
          <Text style={styles.errorText}>{error}</Text>
        )}

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
              !error ? (
                <Text style={styles.infoText}>No collections yet. Create your first one.</Text>
              ) : null
            }
            renderItem={({ item }) => (
              <Pressable
                style={styles.collectionItem}
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.name} collection`}
                onPress={() => router.push(`/collection/${item.id}`)}
              >
                <View
                  style={styles.collectionImage}
                  accessibilityLabel={`${item.name} collection image`}
                >
                  {[0, 1, 2, 3].map((index) => {
                    const imageUrl = item.thumbnail_urls[index];
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
                <View style={styles.collectionTextBlock}>
                  <Text style={styles.collectionName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.collectionMeta}>
                    {item.item_count} items
                  </Text>
                </View>
              </Pressable>
            )}
            onRefresh={() => void loadCollections()}
            refreshing={isLoading}
          />
        )}
      </View>

      <CreateCollectionModal
        visible={modalVisible}
        collectionName={collectionName}
        items={closetItems}
        itemsLoading={itemsLoading}
        selectedItemIds={selectedItemIds}
        saving={saving}
        saveError={saveError}
        onChangeName={setCollectionName}
        onToggleItem={toggleItem}
        onSave={() => void handleSaveCollection()}
        onClose={() => setModalVisible(false)}
      />
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
    marginTop: Spacing.stackLg,
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
  errorText: {
    ...Typography.bodyMd,
    color: Palette.error,
    textAlign: 'center',
    marginTop: Spacing.stackMd,
  },
});
