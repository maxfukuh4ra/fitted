import { StyleSheet } from "react-native";

import { Palette, Radius, Spacing, Typography } from "@/constants/design";

const DAY_CELL_WIDTH = "14.28%";
const DAY_MARKER_SIZE = 44;

// [GenAI Use] Prompt: style the calendar page — month header, day grid, OOTD/stats toggle.
// [GenAI Use] Reflection: matched spacing and toggle styling to the collections detail screen.
export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.background,
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
    overflow: "visible",
  },
  dayMarker: {
    width: DAY_MARKER_SIZE,
    height: DAY_MARKER_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
    overflow: "visible",
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
    bottom: 6,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Palette.primary,
  },
  // [GenAI Use] Prompt: style the OOTD carousel and monthly stats section below the calendar grid.
  // [GenAI Use] Reflection: aligned section titles and empty states with the collections tab.
  statsSection: {
    marginTop: 0,
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
  statsEmpty: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.stackXl,
  },
  errorText: {
    ...Typography.bodyMd,
    color: Palette.error,
    textAlign: "center",
    marginBottom: Spacing.stackMd,
  },
  logOutfitBtn: {
    marginTop: Spacing.stackSm,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: Palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logOutfitText: {
    ...Typography.labelSm,
    color: Palette.onPrimary,
  },
  dayWearSection: {
    marginTop: 0,
  },
  dayWearTitle: {
    ...Typography.titleLg,
    color: Palette.onBackground,
  },
  dayWearSubtitle: {
    ...Typography.labelSm,
    color: Palette.onSurfaceVariant,
    marginTop: 4,
    marginBottom: Spacing.stackMd,
  },
  dayWearCarousel: {
    marginHorizontal: -Spacing.containerMargin,
  },
  dayWearCarouselContent: {
    paddingHorizontal: Spacing.containerMargin,
  },
  dayWearSeparator: {
    width: Spacing.gutter,
  },
  dayWearCard: {
    width: 132,
    borderRadius: Radius.lg,
    overflow: "hidden",
    backgroundColor: Palette.surfaceContainerLowest,
  },
  dayWearImageWrap: {
    aspectRatio: 3 / 4,
    backgroundColor: Palette.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.stackSm,
  },
  dayWearImage: {
    width: "100%",
    height: "100%",
  },
  dayWearPlaceholder: {
    width: "60%",
    height: "60%",
    borderRadius: Radius.md,
    backgroundColor: Palette.surfaceVariant,
  },
  dayWearCardTitle: {
    ...Typography.bodyMd,
    fontSize: 14,
    lineHeight: 20,
    color: Palette.onSurface,
    padding: 12,
  },
  dayWearLoading: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Palette.outlineVariant,
  },
  bottomToggle: {
    flexDirection: "row",
    backgroundColor: Palette.surfaceContainerLow,
    borderRadius: Radius.lg,
    padding: 4,
    marginBottom: Spacing.stackMd,
  },
  toggleBtn: {
    flex: 1,
    height: 40,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleBtnActive: {
    backgroundColor: Palette.primary,
  },
  toggleText: {
    ...Typography.labelSm,
    color: Palette.onSurfaceVariant,
    textTransform: "none",
    letterSpacing: 0.5,
  },
  toggleTextActive: {
    color: Palette.onPrimary,
  },
});
