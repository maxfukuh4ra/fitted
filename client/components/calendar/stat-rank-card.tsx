import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import {
  FontFamilies,
  Palette,
  Radius,
  Spacing,
  Typography,
} from "@/constants/design";
import type { WornStatItem } from "@/types/calendar";

export const MOCK_MONTHLY_STATS: WornStatItem[] = [
  { rank: "01", name: "White Oxford", wears: 12 },
  { rank: "02", name: "Selvedge Denim", wears: 8 },
  { rank: "03", name: "Black Loafers", wears: 5 },
];

type Props = {
  item: WornStatItem;
  variant: "hero" | "compact";
  style?: StyleProp<ViewStyle>;
};

export function StatRankCard({ item, variant, style }: Props) {
  const isHero = variant === "hero";

  return (
    <Pressable
      style={[
        styles.card,
        isHero ? styles.cardHero : styles.cardCompact,
        style,
      ]}
    >
      {item.imageUri ? (
        <>
          <Image source={{ uri: item.imageUri }} style={styles.image} />
          <View style={styles.overlay} />
        </>
      ) : (
        <>
          <View style={styles.imagePlaceholder} />
          <View style={styles.overlay} />
        </>
      )}

      {isHero ? (
        <View style={styles.heroFooter}>
          <View>
            <Text style={styles.rankPill}>{item.rank}</Text>
            <Text style={styles.heroTitle}>{item.name}</Text>
          </View>
          <View style={styles.heroWearBlock}>
            <Text style={styles.heroWearCount}>{item.wears}</Text>
            <Text style={styles.heroWearLabel}>WEARS</Text>
          </View>
        </View>
      ) : (
        <View style={styles.compactFooter}>
          <Text style={styles.rankPillSmall}>{item.rank}</Text>
          <Text style={styles.compactTitle}>{item.name}</Text>
          <Text style={styles.compactWears}>{item.wears} WEARS</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    overflow: "hidden",
    backgroundColor: Palette.surface,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 32,
    elevation: 4,
  },
  cardHero: {
    height: 280,
  },
  cardCompact: {
    height: 200,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Palette.surfaceContainer,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  heroFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: Spacing.stackMd,
  },
  rankPill: {
    ...Typography.labelSm,
    color: Palette.onPrimary,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    overflow: "hidden",
    alignSelf: "flex-start",
    marginBottom: Spacing.stackSm,
  },
  heroTitle: {
    ...Typography.titleLg,
    color: Palette.onPrimary,
  },
  heroWearBlock: {
    alignItems: "flex-end",
  },
  heroWearCount: {
    ...Typography.headlineMd,
    color: Palette.onPrimary,
    lineHeight: 34,
  },
  heroWearLabel: {
    ...Typography.labelSm,
    color: "rgba(255,255,255,0.8)",
  },
  compactFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  rankPillSmall: {
    ...Typography.labelSm,
    color: Palette.onPrimary,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    overflow: "hidden",
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  compactTitle: {
    ...Typography.bodyMd,
    fontFamily: FontFamilies.bodySemiBold,
    fontWeight: "600",
    color: Palette.onPrimary,
  },
  compactWears: {
    ...Typography.labelSm,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
    textTransform: "none",
    letterSpacing: 0,
  },
});
