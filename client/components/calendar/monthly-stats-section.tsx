import { Text, View } from "react-native";

import { StatRankCard } from "@/components/calendar/stat-rank-card";
import { styles } from "@/components/calendar/calendar-styles";
import type { WornStatItem } from "@/types/calendar";

export function MonthlyStatsSection({ items }: { items: WornStatItem[] }) {
  return (
    <View style={styles.statsSection}>
      <Text style={styles.statsTitle}>Monthly Stats</Text>
      <Text style={styles.statsSubtitle}>TOP 3 MOST WORN</Text>

      {items.length === 0 ? (
        <Text style={styles.statsEmpty}>No wears logged this month yet.</Text>
      ) : (
        <>
          <StatRankCard item={items[0]} variant="hero" />
          {items.length > 1 ? (
            <View style={styles.statsRow}>
              {items.slice(1).map((item) => (
                <StatRankCard
                  key={item.rank}
                  item={item}
                  variant="compact"
                  style={styles.statsCardHalf}
                />
              ))}
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}
