import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Image } from 'expo-image';
import { MainHeader } from '@/components/ui/main-header';
import { Category, SUBCATEGORIES } from '@/constants/categories';
import { Palette, Radius, Spacing, Typography } from '@/constants/design';
import { fetchClosetItems } from '@/lib/items';
import { supabase } from '@/lib/supabase';
import type { ClosetItem } from '@/lib/types/closet';

const SLOTS = [
  { label: 'Top', category: Category.TOPS, slot: 'top' },
  { label: 'Bottom', category: Category.BOTTOMS, slot: 'bottom' },
  { label: 'Shoes', category: Category.SHOES, slot: 'footwear' },
] as const;

type SlotCategory = (typeof SLOTS)[number]['category'];
type SlotIndices = Record<SlotCategory, number>;
const SLOT_CATEGORIES = new Set<string>([Category.TOPS, Category.BOTTOMS, Category.SHOES]);
const SUB_TO_CAT: Record<string, SlotCategory> = {};
for (const [cat, subs] of Object.entries(SUBCATEGORIES)) {
  if (SLOT_CATEGORIES.has(cat)) {
    for (const sub of subs) {
      SUB_TO_CAT[sub.toLowerCase()] = cat as SlotCategory;
    }
  }
}

type SlotRowProps = {
  label: string;
  category: SlotCategory;
  slotItems: ClosetItem[];
  idx: number;
  onNavigate: (dir: 1 | -1) => void;
};

function SlotRow({ label, slotItems, idx, onNavigate }: SlotRowProps) {
  const onNavigateRef = useRef(onNavigate);
  useEffect(() => {
    onNavigateRef.current = onNavigate;
  }, [onNavigate]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5 && Math.abs(gs.dx) > 12,
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -50) onNavigateRef.current(1);
        else if (gs.dx > 50) onNavigateRef.current(-1);
      },
    })
  ).current;

  const current = slotItems[idx] ?? null;

  return (
    <View style={styles.slot}>
      <Text style={styles.slotLabel}>{label}</Text>
      <View style={styles.slotRow}>
        <Pressable
          style={[styles.arrowBtn, slotItems.length < 2 && styles.arrowBtnDisabled]}
          onPress={() => onNavigate(-1)}
          disabled={slotItems.length < 2}
        >
          <MaterialIcons
            name="chevron-left"
            size={28}
            color={slotItems.length < 2 ? Palette.outlineVariant : Palette.onSurface}
          />
        </Pressable>

        <View style={styles.itemCard} {...panResponder.panHandlers}>
          {current?.image_url ? (
            <Image
              source={{ uri: current.image_url }}
              style={styles.itemImage}
              contentFit="contain"
            />
          ) : (
            <View style={styles.itemPlaceholder}>
              <Text style={styles.placeholderText}>
                {slotItems.length === 0
                  ? `No ${label.toLowerCase()}${label === 'Shoes' ? '' : 's'} in closet`
                  : 'No image'}
              </Text>
            </View>
          )}
        </View>

        <Pressable
          style={[styles.arrowBtn, slotItems.length < 2 && styles.arrowBtnDisabled]}
          onPress={() => onNavigate(1)}
          disabled={slotItems.length < 2}
        >
          <MaterialIcons
            name="chevron-right"
            size={28}
            color={slotItems.length < 2 ? Palette.outlineVariant : Palette.onSurface}
          />
        </Pressable>
      </View>

      {slotItems.length > 1 && (
        <Text style={styles.counter}>
          {idx + 1} / {slotItems.length}
        </Text>
      )}
    </View>
  );
}

export default function AvatarScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [indices, setIndices] = useState<SlotIndices>({
    [Category.TOPS]: 0,
    [Category.BOTTOMS]: 0,
    [Category.SHOES]: 0,
  });
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [addToFavorites, setAddToFavorites] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const uid = session?.user?.id;
        if (!uid) {
          setError('Sign in to create outfits.');
          setLoading(false);
          return;
        }
        console.log('[Avatar] loading items for uid:', uid);
        const fetched = await fetchClosetItems(uid);
        console.log('[Avatar] fetched items:', fetched.map(i => ({ id: i.id, category: i.category, name: i.item_name })));
        setItems(fetched);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load items.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const grouped = useMemo(() => {
    const result: Record<SlotCategory, ClosetItem[]> = {
      [Category.TOPS]: [],
      [Category.BOTTOMS]: [],
      [Category.SHOES]: [],
    };
    for (const item of items) {
      // Primary: look up the slot by subcategory (ground truth — comes from a fixed list).
      // Fallback: use the stored category field, normalised to lowercase.
      const catFromSub = item.subcategory ? SUB_TO_CAT[item.subcategory.toLowerCase()] : undefined;
      const catFromField = item.category?.toLowerCase() as SlotCategory | undefined;
      const cat = catFromSub ?? catFromField;
      if (cat && cat in result) result[cat].push(item);
    }
    return result;
  }, [items]);

  const canSave = SLOTS.every(({ category }) => grouped[category].length > 0);

  const navigate = (category: SlotCategory, dir: 1 | -1) => {
    const len = grouped[category].length;
    if (len === 0) return;
    setIndices((prev) => ({
      ...prev,
      [category]: (prev[category] + dir + len) % len,
    }));
  };

  const openSaveModal = () => {
    setAddToFavorites(false);
    setSaveError(null);
    setSaveModalVisible(true);
  };

  const saveOutfit = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) throw new Error('Not signed in.');

      const { data: outfitData, error: outfitError } = await supabase
        .from('outfits')
        .insert([{ user_id: uid }])
        .select();
      if (outfitError) throw outfitError;

      const outfitId = outfitData?.[0]?.id;
      if (!outfitId) throw new Error('Failed to create outfit.');

      const outfitItems = SLOTS.map(({ category, slot }) => ({
        outfit_id: outfitId,
        item_id: grouped[category][indices[category]]?.id,
        slot,
      })).filter((r) => r.item_id);

      const { error: itemsError } = await supabase.from('outfit_items').insert(outfitItems);
      if (itemsError) throw itemsError;

      setSaveModalVisible(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save outfit.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Palette.primary} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <MainHeader />

      <View style={[styles.screen, { paddingBottom: tabBarHeight }]}>
        {SLOTS.map(({ label, category }) => (
          <SlotRow
            key={category}
            label={label}
            category={category}
            slotItems={grouped[category]}
            idx={indices[category]}
            onNavigate={(dir) => navigate(category, dir)}
          />
        ))}

        <View style={styles.actions}>
          <Pressable
            style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
            onPress={openSaveModal}
            disabled={!canSave}
          >
            <MaterialIcons name="bookmark-border" size={20} color={Palette.onPrimary} />
            <Text style={styles.saveBtnText}>Save Outfit</Text>
          </Pressable>
        </View>
      </View>

      <Modal
        visible={saveModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSaveModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSaveModalVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Save Outfit</Text>

            <Pressable
              style={styles.favRow}
              onPress={() => setAddToFavorites((v) => !v)}
            >
              <MaterialIcons
                name={addToFavorites ? 'favorite' : 'favorite-border'}
                size={24}
                color={addToFavorites ? Palette.error : Palette.onSurface}
              />
              <Text style={styles.favLabel}>Add to Favorites</Text>
            </Pressable>

            <View style={styles.collectionsRow}>
              <Text style={styles.collectionsLabel}>Save to Collection</Text>
              <Text style={styles.comingSoon}>Coming soon</Text>
            </View>

            {saveError && <Text style={styles.errorText}>{saveError}</Text>}

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setSaveModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmBtn, saving && styles.saveBtnDisabled]}
                onPress={saveOutfit}
                disabled={saving}
              >
                <Text style={styles.confirmBtnText}>
                  {saving ? 'Saving…' : 'Save'}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.background,
  },
  screen: {
    flex: 1,
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.stackMd,
    gap: Spacing.stackMd,
  },
  slot: {
    flex: 1,
    gap: Spacing.stackSm,
    minHeight: 0,
  },
  slotLabel: {
    ...Typography.labelSm,
    color: Palette.onSurfaceVariant,
  },
  slotRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.stackSm,
  },
  arrowBtn: {
    padding: Spacing.stackSm,
    borderRadius: Radius.full,
    backgroundColor: Palette.surfaceContainerLow,
    alignSelf: 'center',
  },
  arrowBtnDisabled: {
    opacity: 0.3,
  },
  itemCard: {
    flex: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Palette.surfaceContainerLow,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surfaceContainerLow,
    borderRadius: Radius.lg,
  },
  placeholderText: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
  },
  counter: {
    ...Typography.labelSm,
    color: Palette.onSurfaceVariant,
    textAlign: 'center',
  },
  actions: {
    paddingVertical: Spacing.stackMd,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.stackSm,
    backgroundColor: Palette.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.stackMd,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    ...Typography.titleLg,
    color: Palette.onPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Palette.surfaceContainerLowest,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.containerMargin,
    gap: Spacing.stackMd,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Palette.outlineVariant,
    alignSelf: 'center',
    marginBottom: Spacing.stackSm,
  },
  modalTitle: {
    ...Typography.headlineMd,
    color: Palette.onSurface,
  },
  favRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackMd,
    paddingVertical: Spacing.stackSm,
  },
  favLabel: {
    ...Typography.bodyMd,
    color: Palette.onSurface,
  },
  collectionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.stackSm,
    borderTopWidth: 1,
    borderTopColor: Palette.outlineVariant,
  },
  collectionsLabel: {
    ...Typography.bodyMd,
    color: Palette.onSurface,
  },
  comingSoon: {
    ...Typography.labelSm,
    color: Palette.onSurfaceVariant,
  },
  errorText: {
    ...Typography.bodyMd,
    color: Palette.error,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.stackMd,
    paddingTop: Spacing.stackSm,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.stackMd,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.outline,
  },
  cancelBtnText: {
    ...Typography.titleLg,
    color: Palette.onSurface,
  },
  confirmBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.stackMd,
    borderRadius: Radius.md,
    backgroundColor: Palette.primary,
  },
  confirmBtnText: {
    ...Typography.titleLg,
    color: Palette.onPrimary,
  },
});
