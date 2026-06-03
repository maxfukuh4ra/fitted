import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Palette, Spacing, Typography } from "@/constants/design";

export default function AvatarScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.screen}>
        <Text style={styles.title}>Avatar Creator</Text>
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
    marginBottom: Spacing.stackMd,
  },
});
