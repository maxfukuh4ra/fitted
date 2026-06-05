import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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
  const toggleSub = (category: SlotCategory, sub: string) => {
    const current = filters[category];
    const next = current.includes(sub) ? current.filter((s) => s !== sub) : [...current, sub];
    onChangeFilters({ ...filters, [category]: next });
  };

  const clearAll = () => {
    const cleared = {} as SubcategoryFilters;
    for (const { category } of SLOTS) cleared[category] = [];
    onChangeFilters(cleared);
  };

  const hasAnyFilter = SLOTS.some(({ category }) => filters[category].length > 0);

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
            const active = filters[category];
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
          {hasAnyFilter && (
            <Pressable style={styles.clearBtn} onPress={clearAll}>
              <Text style={styles.clearBtnText}>Clear All</Text>
            </Pressable>
          )}
          <Pressable style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

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
    paddingHorizontal: Spacing.stackMd,
    paddingVertical: Spacing.stackSm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.outlineVariant,
    backgroundColor: Palette.surfaceContainerLow,
  },
  chipSelected: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  chipText: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
  },
  chipTextSelected: {
    color: Palette.onPrimary,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.stackSm,
    paddingHorizontal: Spacing.containerMargin,
    paddingVertical: Spacing.stackMd,
    borderTopWidth: 1,
    borderTopColor: Palette.outlineVariant,
  },
  clearBtn: {
    flex: 1,
    paddingVertical: Spacing.stackMd,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.outline,
    alignItems: 'center',
  },
  clearBtnText: {
    ...Typography.titleLg,
    color: Palette.onSurface,
  },
  doneBtn: {
    flex: 2,
    paddingVertical: Spacing.stackMd,
    borderRadius: Radius.md,
    backgroundColor: Palette.primary,
    alignItems: 'center',
  },
  doneBtnText: {
    ...Typography.titleLg,
    color: Palette.onPrimary,
  },
});
