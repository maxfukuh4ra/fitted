import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { CalendarMonthHeader } from "@/components/calendar/calendar-month-header";
import { DayWearCarousel } from "@/components/calendar/day-wear-carousel";
import { MonthlyStatsSection } from "@/components/calendar/monthly-stats-section";
import { styles } from "@/components/calendar/calendar-styles";
import { MainHeader } from "@/components/ui/main-header";
import {
  addMonths,
  formatDayLabel,
  getDefaultSelectedDay,
} from "@/components/calendar/calendar-utils";
import { Palette } from "@/constants/design";
import { loadCalendarMonth } from "@/lib/calendar";
import { formatWornOn, loadDayWears } from "@/lib/wear-log";
import type { WornStatItem } from "@/types/calendar";
import type { DayWearEntry, WearLogItem } from "@/types/wear-log";

function getDayItems(entries: DayWearEntry[]) {
  const items: WearLogItem[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    for (const item of entry.items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      items.push(item);
    }
  }

  return items;
}

export default function CalendarScreen() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(today);
  const [selectedDay, setSelectedDay] = useState<number | null>(
    getDefaultSelectedDay(today),
  );
  const [outfitDays, setOutfitDays] = useState<number[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<WornStatItem[]>([]);
  const [dayWearItems, setDayWearItems] = useState<WearLogItem[]>([]);
  const [dayWearLoading, setDayWearLoading] = useState(false);
  const [bottomView, setBottomView] = useState<"ootd" | "stats">("ootd");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDay(getDefaultSelectedDay(viewDate));
  }, [viewDate]);

  const loadMonth = useCallback(() => {
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

  useEffect(() => {
    loadMonth();
  }, [loadMonth]);

  useFocusEffect(
    useCallback(() => {
      loadMonth();
    }, [loadMonth]),
  );

  useEffect(() => {
    async function loadDayOutfit() {
      if (selectedDay === null) {
        setDayWearItems([]);
        return;
      }

      setDayWearLoading(true);
      setDayWearItems([]);
      try {
        const entries = await loadDayWears(
          viewDate.getFullYear(),
          viewDate.getMonth(),
          selectedDay,
        );
        setDayWearItems(getDayItems(entries));
      } catch {
        setDayWearItems([]);
      } finally {
        setDayWearLoading(false);
      }
    }

    loadDayOutfit();
  }, [viewDate, selectedDay]);

  useFocusEffect(
    useCallback(() => {
      if (selectedDay === null) return;

      loadDayWears(viewDate.getFullYear(), viewDate.getMonth(), selectedDay)
        .then((entries) => setDayWearItems(getDayItems(entries)))
        .catch(() => setDayWearItems([]));
    }, [viewDate, selectedDay]),
  );

  const openLogOutfit = () => {
    if (selectedDay === null) return;
    router.push({
      pathname: "/log-outfit",
      params: {
        wornOn: formatWornOn(
          viewDate.getFullYear(),
          viewDate.getMonth(),
          selectedDay,
        ),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <MainHeader />

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
            {selectedDay !== null ? (
              <Pressable style={styles.logOutfitBtn} onPress={openLogOutfit}>
                <Text style={styles.logOutfitText}>
                  Log what you wore · {viewDate.getMonth() + 1}/{selectedDay}
                </Text>
              </Pressable>
            ) : null}

            <View style={styles.bottomSection}>
              <View style={styles.bottomToggle}>
                <Pressable
                  style={[
                    styles.toggleBtn,
                    bottomView === "ootd" && styles.toggleBtnActive,
                  ]}
                  onPress={() => setBottomView("ootd")}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      bottomView === "ootd" && styles.toggleTextActive,
                    ]}
                  >
                    OOTD
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.toggleBtn,
                    bottomView === "stats" && styles.toggleBtnActive,
                  ]}
                  onPress={() => setBottomView("stats")}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      bottomView === "stats" && styles.toggleTextActive,
                    ]}
                  >
                    Monthly Stats
                  </Text>
                </Pressable>
              </View>

              {bottomView === "ootd" ? (
                selectedDay !== null &&
                (dayWearItems.length > 0 ||
                  (dayWearLoading && outfitDays.includes(selectedDay))) ? (
                  <DayWearCarousel
                    dateLabel={formatDayLabel(
                      viewDate.getFullYear(),
                      viewDate.getMonth(),
                      selectedDay,
                    )}
                    items={dayWearItems}
                    loading={dayWearLoading}
                  />
                ) : (
                  <Text style={styles.statsEmpty}>
                    {selectedDay === null
                      ? "Select a day to see your outfit."
                      : "Nothing logged for this day yet."}
                  </Text>
                )
              ) : (
                <MonthlyStatsSection items={monthlyStats} />
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
