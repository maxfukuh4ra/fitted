import { FontFamilies, Palette, Radius, Spacing, textVariants } from '@/constants/design';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
            <Text style={[textVariants.titleLg, styles.cardLabel, styles.cardLabelDisplayFont, styles.cardLabelSlightlyLarger]}>
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
          <Text style={[textVariants.titleLg, styles.cardLabelDisplayFont, styles.cardLabelSlightlyLarger, { color: Palette.onSurface, marginTop: Spacing.stackMd }]}>
            {category.label}
          </Text>
          <Text style={[textVariants.labelSm, styles.cardSublabel, { color: Palette.onSurfaceVariant }]}>
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
  cardLabelDisplayFont: {
    fontFamily: FontFamilies.display,
  },
  cardLabelSlightlyLarger: {
    fontSize: 22,
    lineHeight: 30,
  },
  cardSublabel: {
    color: Palette.surfaceContainerHigh,
    fontFamily: FontFamilies.body,
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0,
    textTransform: 'none',
    lineHeight: 15,
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