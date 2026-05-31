// Filter bar used in closet and avatar screens
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Palette, Radius, Spacing, Typography } from '@/constants/design';
import type { CategoryFilter } from '@/lib/types/closet';

// Able to pass in different filters (eg. 3 for avatar, more for closet) 
type CategoryFilterBarProps = {
  filters: CategoryFilter[];
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
};

export function CategoryFilterBar({
  filters,
  selectedCategory,
  onSelect,
}: CategoryFilterBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}>
      {filters.map((filter) => {
        const isSelected = selectedCategory === filter.value;

        return (
          <Pressable
            key={filter.value ?? 'all'}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(filter.value)}
            style={({ pressed }) => [
              styles.chip,
              isSelected ? styles.chipSelected : styles.chipUnselected,
              pressed && styles.chipPressed,
            ]}>
            <Text
              style={[
                styles.chipLabel,
                isSelected ? styles.chipLabelSelected : styles.chipLabelUnselected,
              ]}>
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginBottom: Spacing.stackLg,
    marginHorizontal: -Spacing.containerMargin,
  },
  scrollContent: {
    paddingHorizontal: Spacing.containerMargin,
    gap: Spacing.stackSm + 4,
    paddingVertical: Spacing.stackSm,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.full,
  },
  chipSelected: {
    backgroundColor: Palette.primary,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  chipUnselected: {
    backgroundColor: Palette.surfaceContainerHigh,
  },
  chipPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  chipLabel: {
    ...Typography.labelSm,
  },
  chipLabelSelected: {
    color: Palette.onPrimary,
  },
  chipLabelUnselected: {
    color: Palette.onSurfaceVariant,
  },
});
