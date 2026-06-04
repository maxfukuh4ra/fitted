import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { Palette, Radius, Typography } from "@/constants/design";
import { capitalize } from "./profile-utils";

const GENDER_OPTIONS = ["male", "female", "other"] as const;
const GENDER_CHIP_SPRING = {
  friction: 10,
  tension: 120,
  useNativeDriver: true,
} as const;

type GenderChipProps = {
  option: (typeof GENDER_OPTIONS)[number];
  selected: boolean;
  onPress: () => void;
};

function GenderChip({ option, selected, onPress }: GenderChipProps) {
  const animation = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animation, {
      ...GENDER_CHIP_SPRING,
      toValue: selected ? 1 : 0,
    }).start();
  }, [animation, selected]);

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.genderPressable, pressed && styles.genderPressed]}
    >
      <Animated.View
        style={[
          styles.genderChip,
          selected && styles.genderChipSelected,
          { transform: [{ scale }] },
        ]}
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
      </Animated.View>
    </Pressable>
  );
}

export function GenderPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.genderRow}>
      {GENDER_OPTIONS.map((option) => (
        <GenderChip
          key={option}
          option={option}
          selected={value === option}
          onPress={() => onChange(option)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  genderRow: {
    flexDirection: "row",
    gap: 8,
    height: 30,
  },
  genderPressable: {
    flex: 1,
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
  genderPressed: {
    opacity: 0.85,
  },
});
