import { Text, View } from "react-native";

import {
  MOCK_MONTHLY_STATS,
  StatRankCard,
} from "@/components/calendar/stat-rank-card";
import { styles } from "@/components/calendar/calendar-styles";

export function MonthlyStatsSection() {
  const [first, second, third] = MOCK_MONTHLY_STATS;

  return (
    <View style={styles.statsSection}>
      <Text style={styles.statsTitle}>Monthly Stats</Text>
      <Text style={styles.statsSubtitle}>TOP 3 MOST WORN</Text>

      <StatRankCard item={first} variant="hero" />

      <View style={styles.statsRow}>
        <StatRankCard
          item={second}
          variant="compact"
          style={styles.statsCardHalf}
        />
        <StatRankCard
          item={third}
          variant="compact"
          style={styles.statsCardHalf}
        />
      </View>
    </View>
  );
}
