// Placeholder screen for the home screen

import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNavBar, type BottomNavTab } from '@/components/ui/bottom-nav-bar';
import { Palette } from '@/constants/design';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<BottomNavTab>('closet');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen} />
      <BottomNavBar activeTab={activeTab} onTabPress={setActiveTab} />
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
  },
});
