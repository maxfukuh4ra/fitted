import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, Text, View } from "react-native";

import { Palette } from "@/constants/design";

import { formatMonthYear } from "@/components/calendar/calendar-utils";
import { styles } from "@/components/calendar/calendar-styles";

type Props = {
  viewDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

export function CalendarMonthHeader({
  viewDate,
  onPrevMonth,
  onNextMonth,
}: Props) {
  return (
    <View style={styles.monthHeader}>
      <Text style={styles.monthTitle}>{formatMonthYear(viewDate)}</Text>
      <View style={styles.monthNav}>
        <Pressable
          onPress={onPrevMonth}
          style={({ pressed }) => pressed && styles.monthNavBtnPressed}
          accessibilityLabel="Previous month"
        >
          <MaterialIcons
            name="chevron-left"
            size={24}
            color={Palette.onSurfaceVariant}
          />
        </Pressable>
        <Pressable
          onPress={onNextMonth}
          style={({ pressed }) => pressed && styles.monthNavBtnPressed}
          accessibilityLabel="Next month"
        >
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={Palette.onSurfaceVariant}
          />
        </Pressable>
      </View>
    </View>
  );
}
