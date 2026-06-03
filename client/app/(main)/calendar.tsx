import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { CalendarMonthHeader } from "@/components/calendar/calendar-month-header";
import { styles } from "@/components/calendar/calendar-styles";
import { addMonths, getDaysInMonth } from "@/components/calendar/calendar-utils";

export default function CalendarScreen() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(today);
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  useEffect(() => {
    const maxDay = getDaysInMonth(
      viewDate.getFullYear(),
      viewDate.getMonth(),
    );
    setSelectedDay((day) => Math.min(day, maxDay));
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
        <CalendarGrid
          viewDate={viewDate}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
