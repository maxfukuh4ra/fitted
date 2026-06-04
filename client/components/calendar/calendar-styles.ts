import { StyleSheet } from "react-native";

import { Palette, Radius, Spacing, Typography } from "@/constants/design";

const DAY_CELL_WIDTH = "14.28%";
const DAY_MARKER_SIZE = 40;

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
    paddingBottom: 96,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthTitle: {
    ...Typography.headlineMd,
    color: Palette.onSurface,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.stackMd,
  },
  monthNavBtnPressed: {
    opacity: 0.6,
  },
  calendarSection: {
    marginTop: Spacing.stackMd,
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: Spacing.stackMd,
  },
  weekdayLabel: {
    width: DAY_CELL_WIDTH,
    textAlign: "center",
    ...Typography.labelSm,
    color: Palette.onSurfaceVariant,
  },
  dayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCellSlot: {
    width: DAY_CELL_WIDTH,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.stackMd,
  },
  dayMarker: {
    width: DAY_MARKER_SIZE,
    height: DAY_MARKER_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
  },
  dayMarkerWithOutfit: {
    backgroundColor: Palette.surfaceVariant,
  },
  dayMarkerToday: {
    borderWidth: 2,
    borderColor: Palette.primary,
  },
  dayMarkerSelected: {
    backgroundColor: Palette.primary,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  dayText: {
    ...Typography.bodyMd,
    color: Palette.onBackground,
  },
  dayTextToday: {
    fontWeight: "600",
  },
  dayTextSelected: {
    color: Palette.onPrimary,
    fontWeight: "500",
  },
  dayDot: {
    position: "absolute",
    bottom: 7,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Palette.primary,
  },
  statsSection: {
    marginTop: Spacing.stackLg,
  },
  statsTitle: {
    ...Typography.titleLg,
    color: Palette.onBackground,
  },
  statsSubtitle: {
    ...Typography.labelSm,
    color: Palette.onSurfaceVariant,
    marginTop: 4,
    marginBottom: Spacing.stackMd,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.gutter,
    marginTop: Spacing.gutter,
  },
  statsCardHalf: {
    flex: 1,
  },
});
