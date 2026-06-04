import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { CalendarMonthHeader } from "@/components/calendar/calendar-month-header";
import { MonthlyStatsSection } from "@/components/calendar/monthly-stats-section";
import { styles } from "@/components/calendar/calendar-styles";
import {
  addMonths,
  getDefaultSelectedDay,
} from "@/components/calendar/calendar-utils";
import { Palette } from "@/constants/design";
import { loadCalendarMonth } from "@/lib/calendar";
import type { WornStatItem } from "@/types/calendar";

export default function CalendarScreen() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(today);
  const [selectedDay, setSelectedDay] = useState<number | null>(
    getDefaultSelectedDay(today),
  );
  const [outfitDays, setOutfitDays] = useState<number[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<WornStatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDay(getDefaultSelectedDay(viewDate));
  }, [viewDate]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    loadCalendarMonth(viewDate.getFullYear(), viewDate.getMonth())
      .then((result) => {
        setOutfitDays(result.outfitDays);
        setMonthlyStats(result.stats);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [viewDate]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.topBar}>
        <Text style={styles.wordmark}>FITTED</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CalendarMonthHeader
          viewDate={viewDate}
          onPrevMonth={() => setViewDate((d) => addMonths(d, -1))}
          onNextMonth={() => setViewDate((d) => addMonths(d, 1))}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={Palette.primary} size="large" />
          </View>
        ) : (
          <>
            <CalendarGrid
              viewDate={viewDate}
              selectedDay={selectedDay}
              outfitDays={outfitDays}
              onSelectDay={setSelectedDay}
            />
            <MonthlyStatsSection items={monthlyStats} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
