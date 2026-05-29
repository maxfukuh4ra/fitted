import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EditorialWheelPicker } from '@/components/onboarding/EditorialWheelPicker';
import { Palette, Spacing, Typography } from '@/constants/design';

const FEET_MIN = 3;
const FEET_MAX = 8;
const INCHES_MIN = 0;
const INCHES_MAX = 11;

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
  const feetValues = useMemo(
    () => Array.from({ length: FEET_MAX - FEET_MIN + 1 }, (_, i) => FEET_MIN + i),
    [],
  );
  const inchValues = useMemo(
    () => Array.from({ length: INCHES_MAX - INCHES_MIN + 1 }, (_, i) => INCHES_MIN + i),
    [],
  );

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>Height</Text>
      <View style={styles.pickerRow}>
        <EditorialWheelPicker selected={feet} values={feetValues} onSelect={onFeetChange} />
        <Text style={styles.unitLabel}>ft</Text>
        <EditorialWheelPicker selected={inches} values={inchValues} onSelect={onInchesChange} />
        <Text style={styles.unitLabel}>in</Text>
      </View>
    </View>
  );
}

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
