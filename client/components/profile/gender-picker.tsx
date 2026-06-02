import { Pressable, StyleSheet, Text, View } from "react-native";

import { Palette, Radius, Spacing, Typography } from "@/constants/design";
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
    marginTop: 4,
  },
  genderChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.outlineVariant,
    alignItems: "center",
  },
  genderChipSelected: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  genderChipText: {
    ...Typography.labelSm,
    color: Palette.onSurfaceVariant,
  },
  genderChipTextSelected: {
    color: Palette.onPrimary,
  },
});
