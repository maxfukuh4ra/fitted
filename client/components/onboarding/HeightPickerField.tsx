// Height picker field component for the onboarding process
import { StyleSheet, Text, View } from 'react-native';

import { EditorialWheelPicker } from '@/components/onboarding/EditorialWheelPicker';
import { Palette, Spacing, Typography } from '@/constants/design';

const FEET_MIN = 3;
const FEET_MAX = 8;
const INCHES_MIN = 0;
const INCHES_MAX = 11;

const FEET_VALUES = Array.from(
  { length: FEET_MAX - FEET_MIN + 1 },
  (_, i) => FEET_MIN + i,
);
const INCH_VALUES = Array.from(
  { length: INCHES_MAX - INCHES_MIN + 1 },
  (_, i) => INCHES_MIN + i,
);

type HeightPickerFieldProps = {
  feet: number;
  inches: number;
  onFeetChange: (feet: number) => void;
  onInchesChange: (inches: number) => void;
};

export function HeightPickerField({
  feet,
  inches,
  onFeetChange,
  onInchesChange,
}: HeightPickerFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>Height</Text>
      <View style={styles.pickerRow}>
        <EditorialWheelPicker selected={feet} values={FEET_VALUES} onSelect={onFeetChange} />
        <Text style={styles.unitLabel}>ft</Text>
        <EditorialWheelPicker selected={inches} values={INCH_VALUES} onSelect={onInchesChange} />
        <Text style={styles.unitLabel}>in</Text>
      </View>
    </View>
  );
}

// [GenAI Use] Prompt: "Create styles for the height picker field according to the given HTML code. 
// Do not hard-code everything, pull from the constants/design.ts file for colors, fonts, etc."
// [GenAI Use] LLM Response Start
const styles = StyleSheet.create({
  fieldGroup: {
    gap: Spacing.stackSm,
  },
  label: {
    ...Typography.labelSm,
    color: Palette.onSurfaceVariant,
    letterSpacing: 1.2,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Palette.outlineVariant,
    paddingBottom: Spacing.stackSm,
    gap: Spacing.stackSm,
  },
  unitLabel: {
    ...Typography.titleLg,
    color: Palette.onSurfaceVariant,
    marginRight: Spacing.stackMd,
  },
});
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection:
// The styles were created according to the given HTML code. After, seeing the initial output 
// and testing it on my phone,I manually edited and removed styles that were not actively visible 
// or meaningful to the user. 