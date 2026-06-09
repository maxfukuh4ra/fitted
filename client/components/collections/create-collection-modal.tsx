import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { formatSubcategoryLabel } from '@/lib/closet-filters';
import type { ClosetItem } from '@/lib/types/closet';
import { Palette, Radius, Spacing, Typography } from '@/constants/design';

type Props = {
  visible: boolean;
  title?: string;
  confirmLabel?: string;
  showNameInput?: boolean;
  showItemPicker?: boolean;
  emptyText?: string;
  collectionName: string;
  items: ClosetItem[];
  itemsLoading: boolean;
  selectedItemIds: Set<string>;
  saving: boolean;
  saveError: string | null;
  onChangeName: (name: string) => void;
  onToggleItem: (itemId: string) => void;
  onSave: () => void;
  onClose: () => void;
};

function getItemDisplayName(item: ClosetItem): string {
  const name = item.item_name?.trim();
  if (name) return name;
  return formatSubcategoryLabel(item.subcategory);
}

export function CreateCollectionModal({
  visible,
  title = 'Create Collection',
  confirmLabel = 'Save',
  showNameInput = true,
  showItemPicker = true,
  emptyText = 'No items in your closet yet.',
  collectionName,
  items,
  itemsLoading,
  selectedItemIds,
  saving,
  saveError,
  onChangeName,
  onToggleItem,
  onSave,
  onClose,
}: Props) {
  const canSave = showNameInput
    ? collectionName.trim().length > 0
    : selectedItemIds.size > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>

          {showNameInput && (
            <View style={styles.nameInputWrap}>
              <Text
                pointerEvents="none"
                style={[
                  styles.nameValueText,
                  collectionName.length === 0 && styles.namePlaceholder,
                ]}
                numberOfLines={1}
              >
                {collectionName.length > 0 ? collectionName : 'Enter name'}
              </Text>
              <TextInput
                style={styles.nameInput}
                value={collectionName}
                onChangeText={onChangeName}
                maxLength={80}
                returnKeyType="done"
                accessibilityLabel="Collection name"
                selectionColor={Palette.primary}
              />
            </View>
          )}

          {showItemPicker && (
            <>
              <Text style={styles.sectionLabel}>
                {showNameInput ? 'Add items (optional)' : 'Select items'}
              </Text>

              {itemsLoading ? (
                <View style={styles.itemsLoading}>
                  <ActivityIndicator size="small" color={Palette.primary} />
                </View>
              ) : items.length === 0 ? (
                <Text style={styles.emptyText}>{emptyText}</Text>
              ) : (
                <FlatList
                  data={items}
                  keyExtractor={(item) => item.id}
                  numColumns={3}
                  style={styles.itemList}
                  contentContainerStyle={styles.itemListContent}
                  columnWrapperStyle={styles.itemRow}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => {
                    const selected = selectedItemIds.has(item.id);
                    const title = getItemDisplayName(item);
                    return (
                      <Pressable
                        style={[styles.itemTile, selected && styles.itemTileSelected]}
                        onPress={() => onToggleItem(item.id)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: selected }}
                        accessibilityLabel={title}
                      >
                        <View style={styles.itemImageWrap}>
                          {item.image_url ? (
                            <Image
                              source={{ uri: item.image_url }}
                              style={styles.itemImage}
                              contentFit="contain"
                            />
                          ) : (
                            <View style={styles.itemImagePlaceholder} />
                          )}
                          {selected && (
                            <View style={styles.checkBadge}>
                              <MaterialIcons name="check" size={14} color={Palette.onPrimary} />
                            </View>
                          )}
                        </View>
                        <Text style={styles.itemLabel} numberOfLines={1}>
                          {title}
                        </Text>
                      </Pressable>
                    );
                  }}
                />
              )}
            </>
          )}

          {saveError && <Text style={styles.errorText}>{saveError}</Text>}

          <View style={styles.actions}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.confirmBtn, saving && styles.confirmBtnDisabled]}
              onPress={onSave}
              disabled={saving || !canSave}
            >
              <Text style={styles.confirmBtnText}>
                {saving ? 'Saving…' : confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Palette.surfaceContainerLowest,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.containerMargin,
    gap: Spacing.stackMd,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Palette.outlineVariant,
    alignSelf: 'center',
    marginBottom: Spacing.stackSm,
  },
  title: {
    ...Typography.headlineMd,
    color: Palette.onSurface,
  },
  nameInputWrap: {
    height: 48,
    borderWidth: 1,
    borderColor: Palette.outlineVariant,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  nameValueText: {
    ...Typography.bodyMd,
    position: 'absolute',
    left: Spacing.stackMd,
    right: Spacing.stackMd,
    top: 11,
    color: Palette.onSurface,
  },
  namePlaceholder: {
    color: Palette.onSurfaceVariant,
  },
  nameInput: {
    ...Typography.bodyMd,
    height: 48,
    color: 'transparent',
    paddingHorizontal: Spacing.stackMd,
    paddingTop: 10,
    paddingBottom: 10,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
  },
  itemsLoading: {
    paddingVertical: Spacing.stackLg,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
    textAlign: 'center',
    paddingVertical: Spacing.stackMd,
  },
  itemList: {
    maxHeight: 280,
  },
  itemListContent: {
    gap: Spacing.stackSm,
    paddingBottom: Spacing.stackSm,
  },
  itemRow: {
    gap: Spacing.stackSm,
  },
  itemTile: {
    flex: 1,
    maxWidth: '31%',
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 4,
  },
  itemTileSelected: {
    borderColor: Palette.primary,
    backgroundColor: Palette.surfaceContainerLow,
  },
  itemImageWrap: {
    aspectRatio: 3 / 4,
    borderRadius: Radius.sm,
    backgroundColor: Palette.surfaceContainerLow,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemImagePlaceholder: {
    width: '50%',
    height: '50%',
    borderRadius: Radius.sm,
    backgroundColor: Palette.surfaceVariant,
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: Radius.full,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    ...Typography.labelSm,
    color: Palette.onSurface,
    textAlign: 'center',
    marginTop: 7,
    textTransform: 'none',
    letterSpacing: 0,
  },
  errorText: {
    ...Typography.bodyMd,
    color: Palette.error,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.stackMd,
    paddingTop: Spacing.stackSm,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.outline,
  },
  cancelBtnText: {
    ...Typography.labelSm,
    color: Palette.onSurface,
    transform: [{ translateY: 1 }],
  },
  confirmBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.primary,
    backgroundColor: Palette.primary,
  },
  confirmBtnDisabled: {
    opacity: 0.4,
  },
  confirmBtnText: {
    ...Typography.labelSm,
    color: Palette.onPrimary,
    transform: [{ translateY: 1 }],
  },
});
