import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { router, Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";

import {
  BottomNavBar,
  type BottomNavTab,
} from "@/components/ui/bottom-nav-bar";
import { Palette } from "@/constants/design";

function MainTabBar({ state, navigation }: BottomTabBarProps) {
  const activeTab = state.routes[state.index].name as BottomNavTab;

  return (
    <BottomNavBar
      activeTab={activeTab}
      onTabPress={(tab) => {
        if (tab === "upload") {
          router.push("/upload");
          return;
        }
        if (tab === activeTab) {
          return;
        }

        navigation.navigate(tab);
      }}
    />
  );
}

export default function MainLayout() {
  return (
    <View style={styles.container}>
      <Tabs
        tabBar={(props) => <MainTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          animation: "none",
        }}
      >
        <Tabs.Screen name="closet" options={{ title: "My Closet" }} />
        <Tabs.Screen name="collections" options={{ title: "Collections" }} />
        <Tabs.Screen name="avatar" options={{ title: "Avatar" }} />
        <Tabs.Screen name="upload" options={{ title: "Upload" }} />
        <Tabs.Screen name="calendar" options={{ title: "Calendar" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
});
