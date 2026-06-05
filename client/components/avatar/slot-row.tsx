import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette, Radius, Spacing, Typography } from '@/constants/design';
import type { ClosetItem } from '@/lib/types/closet';
import type { SlotCategory } from './slots';

type Props = {
  label: string;
  category: SlotCategory;
  slotItems: ClosetItem[];
  idx: number;
  onNavigate: (dir: 1 | -1) => void;
  slotFlex: number;
};

export function SlotRow({ label, slotItems, idx, onNavigate, slotFlex }: Props) {
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
    <View style={[styles.slot, { flex: slotFlex }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    minHeight: 0,
    gap: 4,
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
});
