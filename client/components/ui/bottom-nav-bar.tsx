import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, Spacing } from '@/constants/design';

// Bottom navigation bar items
export type BottomNavTab = 'closet' | 'collections' | 'upload' | 'calendar' | 'profile';
// Bottom navigation bar as a whole knows which one is active and what to do when a tab is pressed
export type BottomNavBarProps = {
  activeTab: BottomNavTab;
  onTabPress: (tab: BottomNavTab) => void;
};

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];
type NavItemConfig = {
  id: BottomNavTab;
  label: string;
  icon: MaterialIconName;
};
const NAV_ITEMS: NavItemConfig[] = [
  { id: 'closet', label: 'My Closet', icon: 'checkroom' },
  { id: 'collections', label: 'Collections', icon: 'accessibility' },
  { id: 'upload', label: 'Upload', icon: 'add-circle' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar-month' },
  { id: 'profile', label: 'Profile', icon: 'person' },
];

const ICON_SIZE = 24;
const ACTIVE_SCALE = 1.1;

// Each navigation item has an id, label, and icon
type NavItemProps = {
  item: NavItemConfig;
  isActive: boolean;
  onPress: (tab: BottomNavTab) => void;
};

// Handle press event and navigation
function NavItem({ item, isActive, onPress }: NavItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: isActive }}
      onPress={() => onPress(item.id)}
      style={({ pressed }) => [
        styles.navItem,
        isActive && styles.navItemActive,
        pressed && styles.navItemPressed,
      ]}>
      <MaterialIcons
        name={item.icon}
        size={isActive ? ICON_SIZE + 2 : ICON_SIZE}
        color={isActive ? Palette.onSurface : Palette.outline}
      />
    </Pressable>
  );
}

export function BottomNavBar({ activeTab, onTabPress }: BottomNavBarProps) {
  const { bottom } = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(bottom, Spacing.stackMd) }]}>
      {NAV_ITEMS.map((item) => (
        <NavItem
          key={item.id}
          item={item}
          isActive={activeTab === item.id}
          onPress={onTabPress}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: Spacing.stackMd,
    paddingHorizontal: Spacing.containerMargin,
    backgroundColor: Palette.surfaceContainerLowest,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scale: 1 }],
  },
  navItemActive: {
    transform: [{ scale: ACTIVE_SCALE }],
  },
  navItemPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});
