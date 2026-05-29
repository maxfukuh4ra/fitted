// Wheel picker component for the height field in onboarding process
import { useEffect, useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Palette, Typography } from '@/constants/design';

const ITEM_HEIGHT = 44;
const VISIBLE_COUNT = 3;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;

type EditorialWheelPickerProps = {
  values: number[];
  selected: number;
  onSelect: (value: number) => void;
};

export function EditorialWheelPicker({
  values,
  selected,
  onSelect,
}: EditorialWheelPickerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const paddingVertical = ITEM_HEIGHT * Math.floor(VISIBLE_COUNT / 2);

  useEffect(() => {
    const index = values.indexOf(selected);
    if (index < 0) return;

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: false });
    });
  }, [selected, values]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.min(
      values.length - 1,
      Math.max(0, Math.round(offsetY / ITEM_HEIGHT)),
    );
    onSelect(values[index]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.selectionHighlight} pointerEvents="none" />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        nestedScrollEnabled
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        contentContainerStyle={{ paddingVertical }}
        style={styles.scroll}
      >
        {values.map((value) => {
          const isSelected = value === selected;
          return (
            <View key={value} style={styles.item}>
              <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                {value}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 56,
    height: PICKER_HEIGHT,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  selectionHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: ITEM_HEIGHT,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Palette.outlineVariant,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    ...Typography.titleLg,
    color: Palette.outline,
  },
  itemTextSelected: {
    color: Palette.primary,
  },
});
