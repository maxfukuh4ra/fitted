import { Pressable, StyleSheet, Text, View } from "react-native";

import { Palette, Radius, Typography } from "@/constants/design";
import { capitalize } from "./profile-utils";

const GENDER_OPTIONS = ["male", "female", "other"] as const;

export function GenderPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.genderRow}>
      {GENDER_OPTIONS.map((option) => {
        const selected = value === option;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.genderChip, selected && styles.genderChipSelected]}
          >
            <Text
              style={[
                Typography.labelSm,
                styles.genderChipText,
                selected && styles.genderChipTextSelected,
              ]}
            >
              {capitalize(option)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  genderRow: {
    flexDirection: "row",
    gap: 8,
    height: 30,
  },
  genderChip: {
    flex: 1,
    height: 30,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.outlineVariant,
    position: "relative",
  },
  genderChipSelected: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  genderChipText: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 7,
    textAlign: "center",
    color: Palette.onSurfaceVariant,
  },
  genderChipTextSelected: {
    color: Palette.onPrimary,
  },
});
