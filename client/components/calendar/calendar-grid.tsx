import { Pressable, Text, View } from "react-native";

import {
  getCalendarCells,
  WEEKDAY_LABELS,
} from "@/components/calendar/calendar-utils";
import { styles } from "@/components/calendar/calendar-styles";

const MOCK_OUTFIT_DAYS = [5, 12, 19];

function getMockOutfitDays(year: number, month: number) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return MOCK_OUTFIT_DAYS.filter((day) => day <= lastDay);
}

type Props = {
  viewDate: Date;
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
};

export function CalendarGrid({ viewDate, selectedDay, onSelectDay }: Props) {
  const today = new Date();
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const cells = getCalendarCells(year, month);
  const outfitDays = getMockOutfitDays(year, month);
  const viewingCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  return (
    <View style={styles.calendarSection}>
      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label, index) => (
          <Text key={`${label}-${index}`} style={styles.weekdayLabel}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.dayGrid}>
        {cells.map((cell, index) => {
          if (cell.day === null) {
            return <View key={`empty-${index}`} style={styles.dayCellSlot} />;
          }

          const hasOutfit = outfitDays.includes(cell.day);
          const isSelected =
            selectedDay !== null && cell.day === selectedDay;
          const isToday =
            viewingCurrentMonth && cell.day === today.getDate();

          return (
            <View key={`day-${cell.day}`} style={styles.dayCellSlot}>
              <Pressable
                onPress={() => onSelectDay(cell.day)}
                style={[
                  styles.dayMarker,
                  hasOutfit && !isSelected && styles.dayMarkerWithOutfit,
                  isToday && !isSelected && styles.dayMarkerToday,
                  isSelected && styles.dayMarkerSelected,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isToday && !isSelected && styles.dayTextToday,
                    isSelected && styles.dayTextSelected,
                  ]}
                >
                  {cell.day}
                </Text>
                {hasOutfit && !isSelected && <View style={styles.dayDot} />}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
