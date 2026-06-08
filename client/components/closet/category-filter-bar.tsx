// Filter bar used in closet and avatar screens
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Palette, Radius, Spacing, Typography } from '@/constants/design';
import type { CategoryFilter } from '@/lib/types/closet';

// Able to pass in different filters (eg. 3 for avatar, more for closet) 
type CategoryFilterBarProps = {
  filters: CategoryFilter[];
  selectedValue: string | null;
  onSelect: (value: string | null) => void;
};

type ChipLayout = {
  x: number;
  width: number;
};

const CHIP_ANIMATION_DURATION = 160;
const PILL_SPRING_CONFIG = {
  friction: 12,
  tension: 90,
  useNativeDriver: true,
} as const;

function getFilterKey(value: string | null) {
  return value ?? 'all';
}

type FilterChipProps = {
  filter: CategoryFilter;
  isSelected: boolean;
  onPress: (value: string | null) => void;
  onLayout: (event: LayoutChangeEvent) => void;
};

function FilterChip({ filter, isSelected, onPress, onLayout }: FilterChipProps) {
  const animation = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  // [GenAI Use] Prompt:
  // "Add a subtle animation when a filter chip is selected so the tap feels responsive."
  // [GenAI Use] LLM Response Start
  useEffect(() => {
    Animated.timing(animation, {
      toValue: isSelected ? 1 : 0,
      duration: CHIP_ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  }, [animation, isSelected]);

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.72, 1],
  });
  // [GenAI Use] LLM Response End
  // [GenAI Use] Reflection:
  // I toned down the scale after testing on my phone, since a small bump was enough
  // without making the chips feel jumpy.

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onLayout={onLayout}
      onPress={() => onPress(filter.value)}
      style={({ pressed }) => [styles.pressable, pressed && styles.chipPressed]}>
      <Animated.View
        style={[
          styles.chip,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}>
        <Text
          style={[
            styles.chipLabel,
            isSelected ? styles.chipLabelSelected : styles.chipLabelUnselected,
          ]}>
          {filter.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function CategoryFilterBar({
  filters,
  selectedValue,
  onSelect,
}: CategoryFilterBarProps) {
  const [chipLayouts, setChipLayouts] = useState<Record<string, ChipLayout>>({});
  const pillTranslateX = useRef(new Animated.Value(0)).current;
  const hasMounted = useRef(false);

  const selectedKey = getFilterKey(selectedValue);
  const selectedLayout = chipLayouts[selectedKey];

  useEffect(() => {
    setChipLayouts((current) => {
      const nextLayouts: Record<string, ChipLayout> = {};

      for (const filter of filters) {
        const key = getFilterKey(filter.value);
        if (current[key]) {
          nextLayouts[key] = current[key];
        }
      }

      const currentKeys = Object.keys(current);
      const nextKeys = Object.keys(nextLayouts);
      const isSame =
        currentKeys.length === nextKeys.length &&
        currentKeys.every((key) => current[key] === nextLayouts[key]);

      if (isSame) {
        return current;
      }

      return nextLayouts;
    });
  }, [filters]);

  // [GenAI Use] Prompt:
  // "Add a sliding highlight pill that moves to whichever filter chip is selected."
  // [GenAI Use] LLM Response Start
  useEffect(() => {
    if (!selectedLayout) {
      return;
    }

    if (!hasMounted.current) {
      hasMounted.current = true;
      pillTranslateX.setValue(selectedLayout.x);
      return;
    }

    Animated.spring(pillTranslateX, {
      ...PILL_SPRING_CONFIG,
      toValue: selectedLayout.x,
    }).start();
  }, [pillTranslateX, selectedLayout, selectedValue]);

  const handleChipLayout = (key: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;

    setChipLayouts((current) => {
      const existingLayout = current[key];
      if (existingLayout && existingLayout.x === x && existingLayout.width === width) {
        return current;
      }

      return {
        ...current,
        [key]: { x, width },
      };
    });
  };
  // [GenAI Use] LLM Response End
  // [GenAI Use] Reflection:
  // Each chip reports its position via onLayout so the pill knows where to slide.
  // On first render the pill snaps into place; after that it springs when you switch chips.

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}>
      <View style={styles.rail}>
        {selectedLayout ? (
          <Animated.View
            style={[
              styles.pill,
              {
                width: selectedLayout.width,
                transform: [{ translateX: pillTranslateX }],
              },
            ]}
          />
        ) : null}

        {filters.map((filter) => {
          const key = getFilterKey(filter.value);

          return (
            <FilterChip
              key={key}
              filter={filter}
              isSelected={selectedValue === filter.value}
              onPress={onSelect}
              onLayout={(event) => handleChipLayout(key, event)}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

// [GenAI Use] Prompt:
// "Create styles for the category filter bar according to the given HTML code. 
// Do not hard-code everything, pull from the constants/design.ts file for colors, fonts, etc."
// [GenAI Use] LLM Response Start
const styles = StyleSheet.create({
  scroll: {
    marginBottom: Spacing.stackLg,
    marginHorizontal: -Spacing.containerMargin,
  },
  scrollContent: {
    paddingHorizontal: Spacing.containerMargin,
    paddingVertical: Spacing.stackSm,
  },
  rail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.stackSm + 4,
    position: 'relative',
    borderRadius: Radius.full,
    backgroundColor: Palette.surfaceContainerHigh,
    padding: 4,
  },
  pill: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 0,
    borderRadius: Radius.full,
    backgroundColor: Palette.primary,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  pressable: {
    zIndex: 1,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.full,
    backgroundColor: 'transparent',
  },
  chipPressed: {
    opacity: 0.85,
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
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection:
// The styles were created according to the given HTML code. After, seeing the initial output 
// and testing it on my phone, I manually edited and removed styles that were not actively visible 
// or meaningful to the user. 