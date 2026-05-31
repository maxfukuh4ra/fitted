import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EditorialTextField } from '@/components/onboarding/EditorialTextField';
import { HeightPickerField } from '@/components/onboarding/HeightPickerField';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Radius, Spacing, Typography } from '@/constants/design';
import { signUpWithProfile } from '@/lib/sign-up';
import { clearSignUpDraft, getSignUpDraft } from '@/lib/sign-up-draft';
import { validateProfileForm } from '@/lib/validation';

type Gender = 'female' | 'male' | 'other';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
];

export default function PersonalInfoScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [heightFeet, setHeightFeet] = useState(5);
  const [heightInches, setHeightInches] = useState(8);
  const [gender, setGender] = useState<Gender>('female');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getSignUpDraft()) {
      router.replace('/(tabs)');
    }
  }, [router]);

  const handleContinue = async () => {
    const draft = getSignUpDraft();
    if (!draft) {
      setError('Session expired. Go back and enter your email and password again.');
      return;
    }

    const validationError = validateProfileForm({ fullName, age });
    if (validationError) {
      setError(validationError);
      return;
    }

    const trimmedName = fullName.trim();
    const parsedAge = Number.parseInt(age, 10);

    setSubmitting(true);
    setError(null);

    const totalHeightInches = heightFeet * 12 + heightInches;

    const result = await signUpWithProfile({
      email: draft.email,
      password: draft.password,
      name: trimmedName,
      age: parsedAge,
      heightInches: totalHeightInches,
      gender,
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    clearSignUpDraft();
    router.replace('/closet');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.decorativeCircle} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          >
            <IconSymbol color={Palette.onSurfaceVariant} name="chevron.left" size={24} />
          </Pressable>
          <Text style={styles.headerLabel}>Getting to Know You</Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoiding}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.introSection}>
                <Text style={styles.title}>Tell us about yourself</Text>
                <Text style={styles.subtitle}>
                  To curate a wardrobe that perfectly suits you, we need a few basic details to get
                  started.
                </Text>
              </View>

              <View style={styles.formSection}>
                <EditorialTextField
                  autoComplete="name"
                  label="Full Name"
                  onChangeText={setFullName}
                  placeholder="e.g. Jane Doe"
                  value={fullName}
                />

                <EditorialTextField
                  label="Age"
                  maxLength={3}
                  numericOnly
                  onChangeText={setAge}
                  placeholder="Enter your age"
                  value={age}
                />

                <HeightPickerField
                  feet={heightFeet}
                  inches={heightInches}
                  onFeetChange={setHeightFeet}
                  onInchesChange={setHeightInches}
                />

                <View style={styles.genderSection}>
                  <Text style={styles.genderLabel}>I identify as</Text>
                  <View style={styles.genderRow}>
                    {GENDER_OPTIONS.map((option) => {
                      const isActive = gender === option.value;
                      return (
                        <Pressable
                          key={option.value}
                          accessibilityRole="button"
                          accessibilityState={{ selected: isActive }}
                          onPress={() => setGender(option.value)}
                          style={({ pressed }) => [
                            styles.segmentButton,
                            isActive && styles.segmentButtonActive,
                            pressed && !isActive && styles.segmentButtonPressed,
                          ]}
                        >
                          <Text
                            style={[
                              styles.segmentButtonText,
                              isActive && styles.segmentButtonTextActive,
                            ]}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              disabled={submitting}
              onPress={handleContinue}
              style={({ pressed }) => [
                styles.continueButton,
                submitting && styles.continueButtonDisabled,
                pressed && !submitting && styles.continueButtonPressed,
              ]}
            >
              {submitting ? (
                <ActivityIndicator color={Palette.onPrimary} />
              ) : (
                <>
                  <Text style={styles.continueButtonText}>Continue</Text>
                  <IconSymbol color={Palette.onPrimary} name="arrow.forward" size={20} />
                </>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  decorativeCircle: {
    position: 'absolute',
    right: -48,
    top: '50%',
    marginTop: -128,
    width: 256,
    height: 256,
    borderRadius: Radius.full,
    backgroundColor: Palette.surfaceVariant,
    opacity: 0.3,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.stackMd,
    paddingBottom: Spacing.stackMd,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
    borderRadius: Radius.full,
  },
  backButtonPressed: {
    backgroundColor: Palette.surfaceContainer,
  },
  headerLabel: {
    ...Typography.labelSm,
    color: Palette.outline,
    letterSpacing: 2,
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.stackXl,
    paddingBottom: Spacing.stackLg,
  },
  content: {
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
  },
  introSection: {
    marginBottom: Spacing.stackXl,
  },
  title: {
    ...Typography.displayLg,
    color: Palette.primary,
    marginBottom: Spacing.stackSm,
  },
  subtitle: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
  },
  formSection: {
    gap: Spacing.stackLg,
  },
  genderSection: {
    gap: Spacing.stackSm,
    paddingTop: Spacing.stackSm,
  },
  genderLabel: {
    ...Typography.labelSm,
    color: Palette.onSurfaceVariant,
    letterSpacing: 1.2,
    marginBottom: Spacing.stackSm,
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.gutter,
  },
  segmentButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Palette.outlineVariant,
    borderRadius: Radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  segmentButtonPressed: {
    backgroundColor: Palette.surfaceContainer,
  },
  segmentButtonText: {
    ...Typography.bodyMd,
    color: Palette.primary,
  },
  segmentButtonTextActive: {
    color: Palette.onPrimary,
  },
  footer: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.stackXl,
    paddingBottom: Spacing.stackMd,
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
  },
  continueButton: {
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Palette.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.stackSm,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  continueButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  errorText: {
    ...Typography.bodyMd,
    color: Palette.error,
    marginTop: Spacing.stackMd,
  },
  continueButtonText: {
    ...Typography.titleLg,
    color: Palette.onPrimary,
  },
});
