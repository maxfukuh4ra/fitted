// Header that is reused for many pages
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, Spacing, Typography } from '@/constants/design';

export function MainHeader() {
  const { top } = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: top + Spacing.stackMd },
      ]}>
      <Text style={styles.title}>FITTED</Text>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.containerMargin,
    paddingBottom: Spacing.stackMd,
    backgroundColor: Palette.surfaceContainerLowest,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  title: {
    ...Typography.headlineMd,
    color: Palette.onSurface,
    letterSpacing: 3.2,
    textTransform: 'uppercase',
  },
  divider: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Palette.outlineVariant,
    opacity: 0.35,
  },
});
