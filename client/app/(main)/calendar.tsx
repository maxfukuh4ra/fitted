import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CalendarMonthHeader } from "@/components/calendar/calendar-month-header";
import { addMonths } from "@/components/calendar/calendar-utils";
import { styles } from "@/components/calendar/calendar-styles";

export default function CalendarScreen() {
  const [viewDate, setViewDate] = useState(new Date());

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
      </ScrollView>
    </SafeAreaView>
  );
}
