// [GenAI Use] Prompt: import necessary libraries and components for rendering the avatar outfit builder screen, managing closet item state, and saving outfits to Supabase.
// [GenAI Use] Reflection: i reviewed how useBottomTabBarHeight and useMemo worked together to handle layout and derived grouping state for the outfit builder
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { FilterModal } from '@/components/avatar/filter-modal';
import type { SubcategoryFilters } from '@/components/avatar/filter-modal';
import { SaveOutfitModal } from '@/components/avatar/save-outfit-modal';
import type { OutfitVisibility } from '@/components/avatar/save-outfit-modal';
import { SlotRow } from '@/components/avatar/slot-row';
import { CAT_TO_SLOT, SLOTS, SUB_TO_CAT } from '@/components/avatar/slots';
import type { SlotCategory, SlotIndices } from '@/components/avatar/slots';
import { MainHeader } from '@/components/ui/main-header';
import { Category } from '@/constants/categories';
import { Palette, Radius, Spacing, Typography } from '@/constants/design';
import { fetchClosetItems } from '@/lib/items';
import { supabase } from '@/lib/supabase';
import type { ClosetItem } from '@/lib/types/closet';

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
  const [filters, setFilters] = useState<SubcategoryFilters>({
    [Category.TOPS]: [],
    [Category.BOTTOMS]: [],
    [Category.SHOES]: [],
  });
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [addToFavorites, setAddToFavorites] = useState(false);
  const [visibility, setVisibility] = useState<OutfitVisibility>('Private');
  const [saveToCollection, setSaveToCollection] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const uid = session?.user?.id;
        if (!uid) { setError('Sign in to create outfits.'); setLoading(false); return; }
        const fetched = await fetchClosetItems(uid);
        setItems(fetched);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load items.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // [GenAI Use] Prompt: "Filter and sort closet items into three buckets: tops, bottoms, and shoes. Sort them by subcategory first 
  // (falling back to category if needed), and skip any items that don't match the active filters for that slot."
  // [GenAI Use] LLM Response Start
  const grouped = useMemo(() => {
    const result: Record<SlotCategory, ClosetItem[]> = {
      [Category.TOPS]: [],
      [Category.BOTTOMS]: [],
      [Category.SHOES]: [],
    };
    for (const item of items) {
      const catFromSub = item.subcategory ? SUB_TO_CAT[item.subcategory.toLowerCase()] : undefined;
      const catFromField = item.category ? CAT_TO_SLOT[item.category.toLowerCase()] : undefined;

      const cat = catFromSub ?? catFromField;
      if (!cat || !(cat in result)) continue;

      const activeFilters = filters[cat];
      if (activeFilters.length > 0 && item.subcategory && !activeFilters.some((f) => f.toLowerCase() === item.subcategory!.toLowerCase())) continue;

      result[cat].push(item);
    }
    return result;
  }, [items, filters]);
  // [GenAI Use] LLM Response End
  // [GenAI Use] Reflection: the double lookup strategy works perfectly. Also verified that the filters ignore text casing, 
  // so they handle mixed-case database values just fine.

  const canSave = SLOTS.every(({ category }) => grouped[category].length > 0);

  const activeFilterCount = SLOTS.reduce((sum, { category }) => sum + filters[category].length, 0);
  const hasActiveFilters = activeFilterCount > 0;

  const navigate = (category: SlotCategory, dir: 1 | -1) => {
    const len = grouped[category].length;
    if (len === 0) return;
    setIndices((prev) => ({ ...prev, [category]: (prev[category] + dir + len) % len }));
  };

  const openModal = () => {
    setAddToFavorites(false);
    setVisibility('Private');
    setSaveToCollection(false);
    setOutfitName('');
    setSaveError(null);
    setModalVisible(true);
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
        .insert([{ user_id: uid, name: outfitName.trim() || null, visibility }])
        .select();
      if (outfitError) throw new Error(outfitError.message);

      const outfitId = outfitData?.[0]?.id;
      if (!outfitId) throw new Error('Failed to create outfit.');

      const outfitItems = SLOTS.map(({ category, slot }) => ({
        outfit_id: outfitId,
        item_id: grouped[category][indices[category]]?.id,
        slot,
      })).filter((r) => r.item_id);

      const { error: itemsError } = await supabase.from('outfit_items').insert(outfitItems);
      if (itemsError) throw new Error(itemsError.message);

      setModalVisible(false);
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
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <MainHeader />

      <View style={[styles.body, { paddingBottom: tabBarHeight }]}>
        <Pressable
          style={[styles.filterBtn, hasActiveFilters && styles.filterBtnActive]}
          onPress={() => setFilterModalVisible(true)}
          hitSlop={8}
        >
          <MaterialIcons
            name="tune"
            size={20}
            color={hasActiveFilters ? Palette.onPrimary : Palette.onSurface}
          />
        </Pressable>
        {SLOTS.map(({ label, category, slotFlex }) => (
          <SlotRow
            key={category}
            label={label}
            category={category}
            slotFlex={slotFlex}
            slotItems={grouped[category]}
            idx={indices[category]}
            onNavigate={(dir) => navigate(category, dir)}
          />
        ))}

        <View style={styles.actions}>
          <Pressable
            style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
            onPress={openModal}
            disabled={!canSave}
          >
            <MaterialIcons name="bookmark-border" size={20} color={Palette.onPrimary} />
            <Text style={styles.saveBtnText}>Save Outfit</Text>
          </Pressable>
        </View>
      </View>

      <FilterModal
        visible={filterModalVisible}
        filters={filters}
        onChangeFilters={setFilters}
        onClose={() => setFilterModalVisible(false)}
      />

      <SaveOutfitModal
        visible={modalVisible}
        outfitName={outfitName}
        addToFavorites={addToFavorites}
        visibility={visibility}
        saveToCollection={saveToCollection}
        saving={saving}
        saveError={saveError}
        onChangeName={setOutfitName}
        onToggleFavorites={() => setAddToFavorites((v) => !v)}
        onChangeVisibility={setVisibility}
        onToggleSaveToCollection={() => setSaveToCollection((v) => !v)}
        onSave={saveOutfit}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

// [GenAI Use] AI was used to format and style these components using the theme, spacing, and design tokens from the constants folder.
// [GenAI Use] Reflection: i reviewed the spacing and palette choices and confirmed they matched the overall app design language
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.background,
  },
  filterBtn: {
    position: 'absolute',
    top: Spacing.stackMd,
    right: Spacing.containerMargin,
    zIndex: 1,
    padding: Spacing.stackSm,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Palette.outlineVariant,
  },
  filterBtnActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  body: {
    flex: 1,
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.stackMd,
    gap: Spacing.stackSm,
  },
  actions: {
    paddingVertical: Spacing.stackMd,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.stackSm,
    paddingVertical: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.primary,
    backgroundColor: Palette.primary,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    ...Typography.labelSm,
    color: Palette.onPrimary,
    transform: [{ translateY: 1 }],
  },
  errorText: {
    ...Typography.bodyMd,
    color: Palette.error,
  },
});
