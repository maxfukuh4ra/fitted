import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ClosetItemCard } from '@/components/closet/closet-item-card';
import { CreateCollectionModal } from '@/components/collections/create-collection-modal';
import { Palette, Radius, Spacing, Typography } from '@/constants/design';
import { getCurrentUser } from '@/lib/auth';
import {
  addItemsToCollection,
  deleteCollection,
  fetchCollectionDetail,
  removeItemFromCollection,
  type CollectionDetail,
} from '@/lib/collections';
import { fetchClosetItems } from '@/lib/items';
import type { ClosetItem } from '@/lib/types/closet';

type Props = {
  collectionId: string;
};

export function CollectionDetailScreen({ collectionId }: Props) {
  const insets = useSafeAreaInsets();
  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editItemsSnapshot, setEditItemsSnapshot] = useState<ClosetItem[]>([]);
  const [editedItems, setEditedItems] = useState<ClosetItem[]>([]);
  const [isSavingEdits, setIsSavingEdits] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [addItemsModalVisible, setAddItemsModalVisible] = useState(false);
  const [closetItems, setClosetItems] = useState<ClosetItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [addingItems, setAddingItems] = useState(false);
  const [addItemsError, setAddItemsError] = useState<string | null>(null);

  const loadCollection = useCallback(async () => {
    if (!collectionId) {
      setError('Collection not found.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCollectionDetail(collectionId);
      setCollection(data);
    } catch (e) {
      setCollection(null);
      setError(e instanceof Error ? e.message : 'Failed to load collection.');
    } finally {
      setIsLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    void loadCollection();
  }, [loadCollection]);

  function handleStartEdit() {
    const items = collection?.items ?? [];
    setEditItemsSnapshot(items);
    setEditedItems(items);
    setIsEditing(true);
    setMenuVisible(false);
  }

  async function handleDoneEditing() {
    if (!collection || isSavingEdits) return;

    setIsSavingEdits(true);
    try {
      const removedIds = editItemsSnapshot
        .filter((item) => !editedItems.some((edited) => edited.id === item.id))
        .map((item) => item.id);

      for (const itemId of removedIds) {
        await removeItemFromCollection(collection.id, itemId);
      }

      setCollection((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: editedItems,
          item_count: editedItems.length,
          thumbnail_urls: editedItems
            .map((item) => item.image_url)
            .filter((url): url is string => Boolean(url))
            .slice(0, 4),
        };
      });

      setIsEditing(false);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save changes.');
      setIsEditing(false);
      await loadCollection();
    } finally {
      setIsSavingEdits(false);
    }
  }

  async function openAddItemsModal() {
    setSelectedItemIds(new Set());
    setAddItemsError(null);
    setAddItemsModalVisible(true);

    setItemsLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        setAddItemsError('Sign in to add items.');
        setClosetItems([]);
        return;
      }
      const items = await fetchClosetItems(user.id);
      const existingIds = new Set(collection?.items.map((item) => item.id) ?? []);
      setClosetItems(items.filter((item) => !existingIds.has(item.id)));
    } catch (e) {
      setAddItemsError(e instanceof Error ? e.message : 'Failed to load items.');
      setClosetItems([]);
    } finally {
      setItemsLoading(false);
    }
  }

  function toggleAddItem(itemId: string) {
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

  async function handleAddItems() {
    if (!collection || addingItems || selectedItemIds.size === 0) return;

    setAddingItems(true);
    setAddItemsError(null);
    try {
      const user = await getCurrentUser();
      if (!user) {
        setAddItemsError('Sign in to add items.');
        return;
      }

      await addItemsToCollection(
        collection.id,
        user.id,
        collection.name,
        [...selectedItemIds],
      );
      setAddItemsModalVisible(false);
      await loadCollection();
    } catch (e) {
      setAddItemsError(e instanceof Error ? e.message : 'Failed to add items.');
    } finally {
      setAddingItems(false);
    }
  }

  const showBottomBar = !isLoading && !error;
  const bottomBarPadding = insets.bottom + 88;

  const displayedItems = isEditing ? editedItems : (collection?.items ?? []);

  function handleRemoveItem(item: ClosetItem) {
    setEditedItems((prev) => prev.filter((i) => i.id !== item.id));
  }

  function handleDeleteCollection() {
    if (!collection || isDeleting) return;

    setMenuVisible(false);

    Alert.alert(
      'Delete collection',
      `Delete "${collection.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setIsDeleting(true);
              try {
                await deleteCollection(collection.id);
                router.back();
              } catch (e) {
                Alert.alert(
                  'Error',
                  e instanceof Error ? e.message : 'Failed to delete collection.',
                );
              } finally {
                setIsDeleting(false);
              }
            })();
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {menuVisible && (
        <Pressable
          style={styles.menuDismissLayer}
          onPress={() => setMenuVisible(false)}
          accessibilityLabel="Close menu"
        />
      )}

      <View style={[styles.header, menuVisible && styles.headerRaised]}>
        <View style={styles.headerSide}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}
          >
            <MaterialIcons name="arrow-back" size={24} color={Palette.onSurface} />
          </Pressable>
        </View>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {collection?.name ?? 'Collection'}
          </Text>
        </View>

        <View style={[styles.headerSide, styles.headerSideRight, styles.menuAnchor]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Collection options"
            onPress={() => setMenuVisible((visible) => !visible)}
            style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}
          >
            <MaterialIcons name="more-vert" size={24} color={Palette.onSurface} />
          </Pressable>

          {menuVisible && (
            <View style={styles.menuDropdown}>
              {!isEditing && (
                <>
                  <Pressable
                    accessibilityRole="button"
                    onPress={handleStartEdit}
                    style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                  >
                    <MaterialIcons name="edit" size={16} color={Palette.onSurface} />
                    <Text style={styles.menuItemText}>Edit</Text>
                  </Pressable>
                  <View style={styles.menuDivider} />
                </>
              )}
              <Pressable
                accessibilityRole="button"
                onPress={handleDeleteCollection}
                disabled={isDeleting}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                  isDeleting && styles.menuItemDisabled,
                ]}
              >
                <MaterialIcons name="delete-outline" size={16} color={Palette.error} />
                <Text style={[styles.menuItemText, styles.menuItemTextDestructive]}>Delete</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="small" color={Palette.primary} />
          <Text style={styles.infoText}>Loading collection...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={displayedItems}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={[
            styles.listContent,
            displayedItems.length === 0 && styles.listContentEmpty,
            showBottomBar && { paddingBottom: bottomBarPadding },
          ]}
          columnWrapperStyle={displayedItems.length > 0 ? styles.listRow : undefined}
          ListEmptyComponent={
            <Text style={styles.infoText}>No items in this collection yet.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <View style={styles.itemContainer}>
                <ClosetItemCard item={item} />
                {isEditing && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${item.item_name?.trim() || 'item'}`}
                    onPress={() => handleRemoveItem(item)}
                    style={({ pressed }) => [
                      styles.removeBadge,
                      pressed && styles.removeBadgePressed,
                    ]}
                  >
                    <MaterialIcons name="remove" size={18} color={Palette.onPrimary} />
                  </Pressable>
                )}
              </View>
            </View>
          )}
        />
      )}

      {showBottomBar && (
        <View style={styles.bottomBar} pointerEvents="box-none">
          {isEditing ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Done editing"
              onPress={() => void handleDoneEditing()}
              disabled={isSavingEdits}
              style={({ pressed }) => [
                styles.bottomButton,
                { marginBottom: insets.bottom + Spacing.stackMd },
                pressed && styles.bottomButtonPressed,
                isSavingEdits && styles.bottomButtonDisabled,
              ]}
            >
              <Text style={styles.bottomButtonLabel}>
                {isSavingEdits ? 'Saving…' : 'Done'}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add items"
              onPress={() => void openAddItemsModal()}
              style={({ pressed }) => [
                styles.bottomButton,
                { marginBottom: insets.bottom + Spacing.stackMd },
                pressed && styles.bottomButtonPressed,
              ]}
            >
              <MaterialIcons name="add" size={20} color={Palette.onPrimary} />
              <Text style={styles.bottomButtonLabel}>Add items</Text>
            </Pressable>
          )}
        </View>
      )}

      <CreateCollectionModal
        visible={addItemsModalVisible}
        title="Add items"
        confirmLabel="Add"
        showNameInput={false}
        emptyText="No more items to add."
        collectionName=""
        items={closetItems}
        itemsLoading={itemsLoading}
        selectedItemIds={selectedItemIds}
        saving={addingItems}
        saveError={addItemsError}
        onChangeName={() => {}}
        onToggleItem={toggleAddItem}
        onSave={() => void handleAddItems()}
        onClose={() => setAddItemsModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.containerMargin,
    paddingBottom: Spacing.stackSm,
  },
  headerRaised: {
    zIndex: 2,
  },
  headerSide: {
    width: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSideRight: {
    justifyContent: 'flex-end',
  },
  menuAnchor: {
    position: 'relative',
  },
  menuDismissLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonPressed: {
    backgroundColor: Palette.surfaceContainerLow,
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.headlineMd,
    fontSize: 22,
    lineHeight: 28,
    color: Palette.onSurface,
    textAlign: 'center',
  },
  menuDropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    minWidth: 112,
    borderRadius: Radius.md,
    backgroundColor: Palette.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Palette.outlineVariant,
    overflow: 'hidden',
    zIndex: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  menuItemPressed: {
    backgroundColor: Palette.surfaceContainerLow,
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuItemText: {
    ...Typography.labelSm,
    color: Palette.onSurface,
    textTransform: 'none',
    letterSpacing: 0,
  },
  menuItemTextDestructive: {
    color: Palette.error,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Palette.outlineVariant,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.stackSm,
    paddingHorizontal: Spacing.containerMargin,
  },
  listContent: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.stackSm,
    paddingBottom: Spacing.stackLg,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  listRow: {
    gap: Spacing.gutter,
    marginBottom: Spacing.gutter,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
  },
  itemContainer: {
    position: 'relative',
  },
  removeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Palette.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBadgePressed: {
    opacity: 0.85,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.stackSm,
    marginHorizontal: Spacing.containerMargin,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    backgroundColor: Palette.primary,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  bottomButtonPressed: {
    opacity: 0.85,
  },
  bottomButtonDisabled: {
    opacity: 0.6,
  },
  bottomButtonLabel: {
    ...Typography.titleLg,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
    color: Palette.onPrimary,
  },
  infoText: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
    textAlign: 'center',
  },
  errorText: {
    ...Typography.bodyMd,
    color: Palette.error,
    textAlign: 'center',
  },
});
