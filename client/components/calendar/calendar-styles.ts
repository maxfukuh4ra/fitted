import { StyleSheet } from "react-native";

import { Palette, Spacing, Typography } from "@/constants/design";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    paddingVertical: Spacing.stackMd,
    paddingHorizontal: Spacing.containerMargin,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Palette.outlineVariant,
  },
  wordmark: {
    ...Typography.labelSm,
    color: Palette.onSurface,
    letterSpacing: 6,
    fontSize: 14,
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.stackMd,
    // room for the fixed bottom tab bar
    paddingBottom: 96,
  },
});
