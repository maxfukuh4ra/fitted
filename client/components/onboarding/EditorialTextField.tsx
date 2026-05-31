// Text input component for the onboarding process
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { Palette, Spacing, Typography } from '@/constants/design';

type EditorialTextFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoComplete?: TextInputProps['autoComplete'];
  maxLength?: number;
  numericOnly?: boolean;
};

export function EditorialTextField({
  label,
  value,
  onChangeText,
  placeholder,
  autoComplete,
  maxLength,
  numericOnly = false,
}: EditorialTextFieldProps) {
  const handleChange = (text: string) => {
    onChangeText(numericOnly ? text.replace(/\D/g, '') : text);
  };

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoComplete={autoComplete}
        keyboardType={numericOnly ? 'number-pad' : 'default'}
        maxLength={maxLength}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={Palette.outline}
        style={styles.input}
        value={value}
      />
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
  input: {
    ...Typography.titleLg,
    color: Palette.primary,
    borderBottomWidth: 1,
    borderBottomColor: Palette.outlineVariant,
    paddingVertical: Spacing.stackSm,
    paddingHorizontal: 0,
  },
});
