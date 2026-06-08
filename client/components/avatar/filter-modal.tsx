// [GenAI Use] Prompt: import necessary libraries and components for rendering the subcategory filter modal used on the avatar screen.
// [GenAI Use] Reflection: i looked at how Modal and ScrollView were used together and understood how to structure the sheet layout with draft filter state
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SLOT_SUBCATEGORIES, SLOTS } from '@/components/avatar/slots';
import type { SlotCategory } from '@/components/avatar/slots';
import { Palette, Radius, Spacing, Typography } from '@/constants/design';

export type SubcategoryFilters = Record<SlotCategory, string[]>;

interface FilterModalProps {
  visible: boolean;
  filters: SubcategoryFilters;
  onChangeFilters: (filters: SubcategoryFilters) => void;
  onClose: () => void;
}

export function FilterModal({ visible, filters, onChangeFilters, onClose }: FilterModalProps) {
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  const toggleSub = (category: SlotCategory, sub: string) => {
    const current = draft[category];
    const next = current.includes(sub) ? current.filter((s) => s !== sub) : [...current, sub];
    setDraft({ ...draft, [category]: next });
  };

  const clearAll = () => {
    const cleared = {} as SubcategoryFilters;
    for (const { category } of SLOTS) cleared[category] = [];
    setDraft(cleared);
  };

  const applyAndClose = () => {
    onChangeFilters(draft);
    onClose();
  };

  const hasAnyFilter = SLOTS.some(({ category }) => draft[category].length > 0);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Filter by Subcategory</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <MaterialIcons name="close" size={24} color={Palette.onSurface} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {SLOTS.map(({ label, category }) => {
            const subs = SLOT_SUBCATEGORIES[category];
            const active = draft[category];
            return (
              <View key={category} style={styles.section}>
                <Text style={styles.sectionLabel}>{label}</Text>
                <View style={styles.chips}>
                  {subs.map((sub) => {
                    const selected = active.includes(sub);
                    return (
                      <Pressable
                        key={sub}
                        style={[styles.chip, selected && styles.chipSelected]}
                        onPress={() => toggleSub(category, sub)}
                      >
                        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                          {sub}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.cancelBtn, !hasAnyFilter && styles.cancelBtnDisabled]}
            onPress={clearAll}
            disabled={!hasAnyFilter}
          >
            <Text style={styles.cancelBtnText}>Clear All</Text>
          </Pressable>
          <Pressable style={styles.saveBtn} onPress={applyAndClose}>
            <Text style={styles.saveBtnText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// [GenAI Use] AI was used to format and style these components using the theme, spacing, and design tokens from the constants folder.
// [GenAI Use] Reflection: i reviewed how the chip selection styles toggled between active and inactive states using the palette tokens
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.containerMargin,
    paddingVertical: Spacing.stackMd,
    borderBottomWidth: 1,
    borderBottomColor: Palette.outlineVariant,
  },
  headerTitle: {
    ...Typography.titleLg,
    color: Palette.onSurface,
  },
  scrollContent: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.stackMd,
    paddingBottom: Spacing.stackLg,
    gap: Spacing.stackLg,
  },
  section: {
    gap: Spacing.stackSm,
  },
  sectionLabel: {
    ...Typography.titleLg,
    color: Palette.onSurface,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.stackSm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.outlineVariant,
    backgroundColor: Palette.surfaceContainerLowest,
  },
  chipSelected: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  chipText: {
    ...Typography.labelSm,
    color: Palette.onSurface,
    textTransform: 'none',
    letterSpacing: 0,
    transform: [{ translateY: 1 }],
  },
  chipTextSelected: {
    color: Palette.onPrimary,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.stackMd,
    paddingHorizontal: Spacing.containerMargin,
    paddingVertical: Spacing.stackMd,
    borderTopWidth: 1,
    borderTopColor: Palette.outlineVariant,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.outline,
  },
  cancelBtnDisabled: {
    opacity: 0.4,
  },
  cancelBtnText: {
    ...Typography.labelSm,
    color: Palette.onSurface,
    transform: [{ translateY: 1 }],
  },
  saveBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: Radius.lg,
    backgroundColor: Palette.primary,
  },
  saveBtnText: {
    ...Typography.labelSm,
    color: Palette.onPrimary,
    transform: [{ translateY: 1 }],
  },
});
