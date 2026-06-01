import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette, Radius, Spacing, Typography } from '@/constants/design';

export default function CollectionsScreen() {
  const handleCreateCollection = () => {
    // No-op for now — wire up create-collection flow later
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <Text style={styles.title}>Collections</Text>
        <Text style={styles.description}>
          Organize your wardrobe into curated selections for any occasion, season, or mood.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create collection"
          onPress={handleCreateCollection}
          style={({ pressed }) => [
            styles.createButton,
            pressed && styles.createButtonPressed,
          ]}>
          <MaterialIcons name="add" size={20} color={Palette.onPrimary} />
          <Text style={styles.createButtonLabel}>Create collection</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  screen: {
    flex: 1,
    backgroundColor: Palette.background,
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.containerMargin,
  },
  title: {
    ...Typography.headlineMd,
    color: Palette.onSurface,
  },
  description: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
    marginTop: Spacing.stackSm,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.stackSm,
    marginTop: Spacing.stackMd,
    paddingVertical: 14,
    paddingHorizontal: Spacing.stackMd,
    borderRadius: Radius.lg,
    backgroundColor: Palette.primary,
  },
  createButtonPressed: {
    opacity: 0.85,
  },
  createButtonLabel: {
    ...Typography.titleLg,
    fontSize: 16,
    lineHeight: 22,
    color: Palette.onPrimary,
  },
});
