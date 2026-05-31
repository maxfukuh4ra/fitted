import { Stack, useRouter, useSegments } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BottomNavBar, type BottomNavTab } from '@/components/ui/bottom-nav-bar';
import { Palette } from '@/constants/design';

// Routes for each tab
const TAB_ROUTES: Record<BottomNavTab, `/${BottomNavTab}`> = {
  closet: '/closet',
  collections: '/collections',
  upload: '/upload',
  calendar: '/calendar',
  profile: '/profile',
};

const TAB_IDS = new Set<string>(Object.keys(TAB_ROUTES));

function segmentToTab(segment: string | undefined): BottomNavTab {
  if (segment && TAB_IDS.has(segment)) {
    return segment as BottomNavTab;
  }
  return 'closet';
}

export default function MainLayout() {
  const router = useRouter();
  const segments = useSegments();
  const activeTab = segmentToTab(segments[segments.length - 1]);

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }} />
      <BottomNavBar
        activeTab={activeTab}
        onTabPress={(tab) => {
          if (tab !== activeTab) {
            router.replace(TAB_ROUTES[tab]);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
});
