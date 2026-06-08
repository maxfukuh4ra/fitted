// [GenAI Use] Prompt: 
// "Import necessary libraries and components for a personal info screen with a form 
// for full name, age, height, and gender."
// [GenAI Use] LLM Response Start
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HeightPickerField } from "@/components/onboarding/HeightPickerField";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Palette, Radius, Spacing, Typography } from "@/constants/design";
import { signUpWithProfile } from "@/lib/sign-up";
import { clearSignUpDraft, getSignUpDraft } from "@/lib/sign-up-draft";
import { validateProfileForm } from "@/lib/validation";
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection:
// The imported libraries and components were necessary to create the personal info screen. 
// I manually edited and removed imports that were not used or excessive to our functionality. I also followed
// up and imported necessary components that I created for this screen which was not from outside libraries. 

type Gender = "female" | "male" | "other";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
];

export default function PersonalInfoScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [heightFeet, setHeightFeet] = useState(5);
  const [heightInches, setHeightInches] = useState(8);
  const [gender, setGender] = useState<Gender>("female");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getSignUpDraft()) {
      router.replace("/");
    }
  }, [router]);

  const handleContinue = async () => {
    // Get the sign up draft and save
    const draft = getSignUpDraft();
    if (!draft) {
      setError(
        "Session expired. Go back and enter your email and password again.",
      );
      return;
    }
    // Check if the full name and age are valid
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
    // Redirect to the closet screen
    router.replace("/closet");
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
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
          >
            <IconSymbol
              color={Palette.onSurfaceVariant}
              name="chevron.left"
              size={24}
            />
          </Pressable>
          <Text style={styles.headerLabel}>Sign Up</Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
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
                  To curate a wardrobe that perfectly suits you, we need a few
                  basic details to get started.
                </Text>
              </View>

              <View style={styles.formSection}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Full Name</Text>
                  <TextInput
                    autoComplete="name"
                    onChangeText={setFullName}
                    placeholder="e.g. Jane Doe"
                    placeholderTextColor={Palette.outline}
                    style={styles.fieldInput}
                    value={fullName}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Age</Text>
                  <TextInput
                    keyboardType="number-pad"
                    maxLength={3}
                    onChangeText={setAge}
                    placeholder="Enter your age"
                    placeholderTextColor={Palette.outline}
                    style={styles.fieldInput}
                    value={age}
                  />
                </View>

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
                  <IconSymbol
                    color={Palette.onPrimary}
                    name="arrow.forward"
                    size={20}
                  />
                </>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// [GenAI Use] Prompt: "Create styles for the personal info screen according to the given HTML code. 
// Do not hard-code everything, pull from the constants/design.ts file for colors, fonts, etc."
// [GenAI Use] LLM Response Start
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  decorativeCircle: {
    position: "absolute",
    right: -48,
    top: "50%",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.stackSm,
    paddingBottom: Spacing.stackSm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
    borderRadius: Radius.full,
  },
  backButtonPressed: {
    backgroundColor: Palette.surfaceContainer,
  },
  headerLabel: {
    fontFamily: Typography.headlineMd.fontFamily,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '500',
    color: Palette.onSurface,
    letterSpacing: 0,
    textAlign: "center",
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
    paddingTop: Spacing.stackLg,
    paddingBottom: Spacing.stackLg,
  },
  content: {
    maxWidth: 448,
    width: "100%",
    alignSelf: "center",
  },
  introSection: {
    marginBottom: Spacing.stackXl,
  },
  title: {
    ...Typography.headlineMd,
    fontSize: 32,
    lineHeight: 38,
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
  fieldGroup: {
    gap: Spacing.stackSm,
  },
  fieldLabel: {
    ...Typography.labelSm,
    color: Palette.onSurfaceVariant,
    letterSpacing: 1.2,
  },
  fieldInput: {
    ...Typography.titleLg,
    color: Palette.primary,
    borderBottomWidth: 1,
    borderBottomColor: Palette.outlineVariant,
    paddingVertical: Spacing.stackSm,
    paddingHorizontal: 0,
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
    flexDirection: "row",
    gap: Spacing.gutter,
  },
  segmentButton: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Palette.outlineVariant,
    borderRadius: Radius.md,
    backgroundColor: Palette.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  segmentButtonPressed: {
    backgroundColor: Palette.surfaceContainerLow,
  },
  segmentButtonText: {
    ...Typography.labelSm,
    color: Palette.onSurface,
    textTransform: 'none',
    letterSpacing: 0,
    transform: [{ translateY: 1 }],
  },
  segmentButtonTextActive: {
    color: Palette.onPrimary,
  },
  footer: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.stackLg,
    paddingBottom: Spacing.stackSm,
    maxWidth: 448,
    width: "100%",
    alignSelf: "center",
  },
  continueButton: {
    height: 52,
    borderRadius: Radius.lg,
    backgroundColor: Palette.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.stackSm,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
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
    ...Typography.bodyMd,
    color: Palette.onPrimary,
  },
});
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection:
// The styles were created according to the given HTML code. After, seeing the initial output 
// and testing it on my phone,I manually edited and removed styles that were not actively visible 
// or meaningful to the user. 