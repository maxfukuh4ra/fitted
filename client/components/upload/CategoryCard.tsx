import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Palette, Spacing, Radius, textVariants } from '@/constants/design';

export type Category = {
  id: string;
  label: string;
  sublabel: string;
  image?: string;
  wide?: boolean;
  tall?: boolean;
};

export default function CategoryCard({
  category,
  onPress,
  style,
  disabled = false,
}: {
  category: Category;
  onPress: () => void;
  style?: object;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.85}
      disabled={disabled}
      onPress={onPress}
      style={[styles.card, disabled && styles.cardDisabled, style]}
    >
      {category.image ? (
        <>
          <Image source={{ uri: category.image }} style={styles.cardImage} />
          <View style={styles.cardOverlay} />
          <View style={styles.cardContent}>
            <Text style={[textVariants.titleLg, styles.cardLabel]}>
              {category.label}
            </Text>
            <Text style={[textVariants.labelSm, styles.cardSublabel]}>
              {category.sublabel}
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.cardPlaceholder}>
          <View style={styles.cardIconCircle}>
            <Text style={styles.cardIcon}>···</Text>
          </View>
          <Text style={[textVariants.titleLg, { color: Palette.onSurface, marginTop: Spacing.stackMd }]}>
            {category.label}
          </Text>
          <Text style={[textVariants.labelSm, { color: Palette.onSurfaceVariant, marginTop: 4 }]}>
            {category.sublabel}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Palette.surfaceContainer,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.stackMd,
  },
  cardLabel: {
    color: Palette.onTertiary,
  },
  cardSublabel: {
    color: Palette.surfaceContainerHigh,
    marginTop: 4,
  },
  cardPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.stackMd,
    backgroundColor: Palette.surfaceContainer,
    borderWidth: 1,
    borderColor: Palette.outlineVariant,
  },
  cardIconCircle: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Palette.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 20,
    color: Palette.onSurface,
    letterSpacing: 2,
  },
});