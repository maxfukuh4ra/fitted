import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
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

import { FontFamilies, Palette, Radius, Spacing, Typography } from '@/constants/design';
import { getCurrentUser } from '@/lib/auth';
import { createCollection, fetchCollections, type Collection } from '@/lib/collections';

type Props = {
  visible: boolean;
  selectedCollections: Collection[];
  onChangeSelectedCollections: (collections: Collection[]) => void;
  onClose: () => void;
};

type Step = 'list' | 'create';

export function SaveToCollectionModal({
  visible,
  selectedCollections,
  onChangeSelectedCollections,
  onClose,
}: Props) {
  const [step, setStep] = useState<Step>('list');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [collectionName, setCollectionName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setStep('list');
      setCollectionName('');
      setCreateError(null);
      return;
    }

    setSelectedIds(new Set(selectedCollections.map((c) => c.id)));

    async function load() {
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

    void load();
  }, [visible, selectedCollections]);

  function toggleCollection(collection: Collection) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(collection.id)) {
        next.delete(collection.id);
      } else {
        next.add(collection.id);
      }
      return next;
    });
  }

  function handleDone() {
    const selected = collections.filter((c) => selectedIds.has(c.id));
    onChangeSelectedCollections(selected);
    onClose();
  }

  function openCreateStep() {
    setCollectionName('');
    setCreateError(null);
    setStep('create');
  }

  async function handleCreateCollection() {
    if (creating || collectionName.trim().length === 0) return;

    setCreating(true);
    setCreateError(null);
    try {
      const user = await getCurrentUser();
      if (!user) {
        setCreateError('Sign in to create a collection.');
        return;
      }

      const created = await createCollection(user.id, collectionName, []);
      setCollections((prev) => [created, ...prev]);
      setSelectedIds((prev) => new Set(prev).add(created.id));
      setStep('list');
      setCollectionName('');
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Failed to create collection.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />

          {step === 'list' ? (
            <>
              <View style={styles.createHeader}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Back to save outfit"
                  onPress={onClose}
                  hitSlop={8}
                  style={styles.headerSideBtn}
                >
                  <MaterialIcons name="arrow-back" size={24} color={Palette.onSurface} />
                </Pressable>
                <Text style={[styles.title, styles.headerTitle]}>Save to Collection</Text>
                <View style={styles.headerSideBtn} />
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Create collection"
                onPress={openCreateStep}
                style={({ pressed }) => [
                  styles.createButton,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <MaterialIcons name="add" size={20} color={Palette.onPrimary} />
                <Text style={styles.createButtonLabel}>Create collection</Text>
              </Pressable>

              {error && !isLoading ? <Text style={styles.errorText}>{error}</Text> : null}

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={Palette.primary} />
                </View>
              ) : (
                <FlatList
                  data={collections}
                  keyExtractor={(item) => item.id}
                  numColumns={3}
                  style={styles.list}
                  contentContainerStyle={[
                    styles.listContent,
                    collections.length === 0 && styles.listContentEmpty,
                  ]}
                  columnWrapperStyle={collections.length > 1 ? styles.listRow : undefined}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    !error ? (
                      <Text style={styles.infoText}>No collections yet.</Text>
                    ) : null
                  }
                  renderItem={({ item }) => {
                    const selected = selectedIds.has(item.id);
                    return (
                      <Pressable
                        style={[styles.collectionItem, selected && styles.collectionItemSelected]}
                        accessibilityRole="checkbox"
                        accessibilityLabel={`Select ${item.name} collection`}
                        accessibilityState={{ checked: selected }}
                        onPress={() => toggleCollection(item)}
                      >
                        <View style={styles.collectionImage}>
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
                          {selected ? (
                            <View style={styles.checkBadge}>
                              <MaterialIcons name="check" size={14} color={Palette.onPrimary} />
                            </View>
                          ) : null}
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
                    );
                  }}
                />
              )}

              <Pressable style={styles.doneBtn} onPress={handleDone}>
                <Text style={styles.doneBtnText}>Done</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.createHeader}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Back to collections"
                  onPress={() => setStep('list')}
                  hitSlop={8}
                  style={styles.headerSideBtn}
                >
                  <MaterialIcons name="arrow-back" size={24} color={Palette.onSurface} />
                </Pressable>
                <Text style={[styles.title, styles.headerTitle]}>Create Collection</Text>
                <View style={styles.headerSideBtn} />
              </View>

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
                  onChangeText={setCollectionName}
                  maxLength={80}
                  returnKeyType="done"
                  accessibilityLabel="Collection name"
                  selectionColor={Palette.primary}
                />
              </View>

              {createError ? <Text style={styles.errorText}>{createError}</Text> : null}

              <View style={styles.actions}>
                <Pressable style={styles.cancelBtn} onPress={() => setStep('list')}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.confirmBtn,
                    (creating || collectionName.trim().length === 0) && styles.confirmBtnDisabled,
                  ]}
                  onPress={() => void handleCreateCollection()}
                  disabled={creating || collectionName.trim().length === 0}
                >
                  <Text style={styles.confirmBtnText}>
                    {creating ? 'Saving…' : 'Save'}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
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
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Palette.outlineVariant,
    alignSelf: 'center',
    marginBottom: Spacing.stackSm,
  },
  createHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSideBtn: {
    width: 24,
  },
  title: {
    ...Typography.headlineMd,
    color: Palette.onSurface,
    flex: 1,
  },
  headerTitle: {
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: Spacing.stackLg,
    alignItems: 'center',
  },
  list: {
    maxHeight: 320,
  },
  listContent: {
    gap: Spacing.stackSm,
    paddingBottom: Spacing.stackSm,
  },
  listRow: {
    justifyContent: 'flex-start',
    gap: Spacing.stackSm,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.stackMd,
  },
  collectionItem: {
    width: '31%',
    borderRadius: Radius.lg,
    paddingTop: Spacing.stackSm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  collectionItemSelected: {
    borderColor: Palette.primary,
    backgroundColor: Palette.surfaceContainerLow,
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
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: Palette.onSurface,
  },
  collectionMeta: {
    ...Typography.bodyMd,
    fontSize: 11,
    lineHeight: 15,
    color: Palette.onSurfaceVariant,
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.stackSm,
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
  doneBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: Radius.lg,
    backgroundColor: Palette.primary,
  },
  doneBtnText: {
    ...Typography.labelSm,
    color: Palette.onPrimary,
    transform: [{ translateY: 1 }],
  },
  nameInputWrap: {
    height: 48,
    borderWidth: 1,
    borderColor: Palette.outlineVariant,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  nameValueText: {
    fontFamily: FontFamilies.body,
    fontSize: 16,
    position: 'absolute',
    left: Spacing.stackMd,
    right: Spacing.stackMd,
    top: 13,
    color: Palette.onSurface,
  },
  namePlaceholder: {
    color: Palette.onSurfaceVariant,
  },
  nameInput: {
    fontFamily: FontFamilies.body,
    fontSize: 16,
    height: 48,
    color: 'transparent',
    paddingHorizontal: Spacing.stackMd,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.stackMd,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
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
    paddingVertical: 12,
    borderRadius: Radius.lg,
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
