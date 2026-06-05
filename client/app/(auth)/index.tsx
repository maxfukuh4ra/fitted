import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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

import {
  FontFamilies,
  LandingAssets,
  Palette,
  Radius,
  Spacing,
  Typography,
} from "@/constants/design";
import { setSignUpDraft } from "@/lib/sign-up-draft";
import { supabase } from "@/lib/supabase";
import {
  formatAuthError,
  normalizeEmail,
  validateAuthCredentials,
} from "@/lib/validation";

export default function HomeScreen() {
  const router = useRouter();

  // Auth state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  // Items state
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for user on mount and redirect if already authenticated
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        router.replace("/(app)/(tabs)/closet");
      }
    });
  }, [router]);

  // Fetch items if user is logged in
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("items")
      .select("*")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setItems(data || []);
        setLoading(false);
      });
  }, [user]);

  const handleSignIn = async () => {
    setAuthError(null);
    setAuthMessage(null);

    const validationError = validateAuthCredentials(email, password);
    if (validationError) {
      setAuthError(validationError);
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email: normalizeEmail(email),
        password,
      },
    );

    if (signInError) {
      setAuthError(formatAuthError(signInError.message));
      return;
    }

    setUser(data.user);
    router.replace("/closet");
  };

  const handleSignUp = () => {
    setAuthError(null);
    setAuthMessage(null);

    const validationError = validateAuthCredentials(email, password);
    if (validationError) {
      setAuthError(validationError);
      return;
    }

    setSignUpDraft(normalizeEmail(email), password);
    router.push("/onboarding/personal-info");
  };

  return (
    <View style={styles.screen}>
      <Image
        source={{ uri: LandingAssets.backgroundImage }}
        style={styles.backgroundImage}
        contentFit="cover"
        blurRadius={2}
      />
      <View style={styles.backgroundScrim} />
      <View style={styles.backgroundGradient} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoiding}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <View style={styles.logoSection}>
                <Text style={styles.brandTitle}>FITTED</Text>
                <Text style={styles.brandTagline}>Curate Your Collection</Text>
              </View>

              {!user && (
                <View style={styles.authSection}>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Email</Text>
                    <View style={styles.inputWrap}>
                      <Text
                        pointerEvents="none"
                        style={[styles.inputValueText, email.length === 0 && styles.inputPlaceholder]}
                        numberOfLines={1}
                      >
                        {email.length > 0 ? email : 'you@example.com'}
                      </Text>
                      <TextInput
                        autoCapitalize="none"
                        autoComplete="email"
                        keyboardType="email-address"
                        onChangeText={setEmail}
                        style={styles.input}
                        value={email}
                        selectionColor={Palette.primary}
                      />
                    </View>
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Password</Text>
                    <View style={styles.inputWrap}>
                      <Text
                        pointerEvents="none"
                        style={[styles.inputValueText, password.length === 0 && styles.inputPlaceholder]}
                        numberOfLines={1}
                      >
                        {password.length > 0 ? '•'.repeat(password.length) : 'Enter your password'}
                      </Text>
                      <TextInput
                        autoCapitalize="none"
                        autoComplete="password"
                        onChangeText={setPassword}
                        secureTextEntry
                        style={styles.input}
                        value={password}
                        selectionColor={Palette.primary}
                      />
                    </View>
                  </View>

                  <View style={styles.actionStack}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={handleSignIn}
                      style={({ pressed }) => [
                        styles.primaryButton,
                        pressed && styles.buttonPressed,
                      ]}
                    >
                      <Text style={styles.primaryButtonText}>Sign In</Text>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      onPress={handleSignUp}
                      style={({ pressed }) => [
                        styles.secondaryButton,
                        pressed && styles.secondaryButtonPressed,
                      ]}
                    >
                      <Text style={styles.secondaryButtonText}>Create Account</Text>
                    </Pressable>
                  </View>

                  {authError ? (
                    <Text style={styles.errorText}>{authError}</Text>
                  ) : null}
                  {authMessage ? (
                    <Text style={styles.messageText}>{authMessage}</Text>
                  ) : null}
                </View>
              )}

              <Text style={styles.footerText}>
                By continuing, you agree to our{" "}
                <Text style={styles.footerLink}>Terms</Text> and{" "}
                <Text style={styles.footerLink}>Privacy</Text>.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.surface,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  backgroundScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Palette.surface,
    opacity: 0.35,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(251, 249, 249, 0.72)",
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.containerMargin,
    paddingVertical: Spacing.stackLg,
  },
  card: {
    width: "100%",
    maxWidth: 448,
    alignSelf: "center",
  },
  logoSection: {
    alignItems: "center",
    marginBottom: Spacing.stackXl,
  },
  brandTitle: {
    ...Typography.displayLg,
    color: Palette.primary,
    letterSpacing: 8,
    textTransform: "uppercase",
    marginBottom: Spacing.stackSm,
  },
  brandTagline: {
    ...Typography.labelSm,
    color: Palette.onSurfaceVariant,
    letterSpacing: 2.4,
  },
  authSection: {
    width: "100%",
    gap: Spacing.stackMd,
  },
  fieldGroup: {
    gap: Spacing.stackSm,
  },
  fieldLabel: {
    ...Typography.labelSm,
    color: Palette.onSurfaceVariant,
    letterSpacing: 1.2,
  },
  inputWrap: {
    height: 52,
    borderWidth: 1,
    borderColor: Palette.outlineVariant,
    borderRadius: Radius.md,
    backgroundColor: Palette.surfaceContainerLowest,
    overflow: 'hidden',
  },
  inputValueText: {
    fontFamily: FontFamilies.body,
    fontSize: 16,
    position: 'absolute',
    left: Spacing.stackMd,
    right: Spacing.stackMd,
    top: 15,
    color: Palette.onSurface,
  },
  inputPlaceholder: {
    color: Palette.onSurfaceVariant,
  },
  input: {
    fontFamily: FontFamilies.body,
    fontSize: 16,
    height: 52,
    color: 'transparent',
    paddingHorizontal: Spacing.stackMd,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  actionStack: {
    gap: Spacing.stackMd,
    marginTop: Spacing.stackSm,
  },
  primaryButton: {
    height: 52,
    borderRadius: Radius.lg,
    backgroundColor: Palette.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  primaryButtonText: {
    ...Typography.bodyMd,
    color: Palette.onPrimary,
  },
  secondaryButton: {
    height: 52,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.outlineVariant,
    backgroundColor: Palette.surfaceContainerLowest,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    ...Typography.bodyMd,
    color: Palette.onSurface,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  secondaryButtonPressed: {
    backgroundColor: Palette.surfaceContainerLow,
  },
  errorText: {
    ...Typography.bodyMd,
    color: Palette.error,
    textAlign: "center",
  },
  messageText: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
    textAlign: "center",
  },
  signedInLabel: {
    ...Typography.labelSm,
    color: Palette.onSurfaceVariant,
    textAlign: "center",
  },
  signedInEmail: {
    ...Typography.titleLg,
    color: Palette.onSurface,
    textAlign: "center",
  },
  loader: {
    marginTop: Spacing.stackSm,
  },
  emptyStateText: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
    textAlign: "center",
  },
  itemsList: {
    gap: Spacing.stackSm,
    marginTop: Spacing.stackSm,
  },
  itemText: {
    ...Typography.bodyMd,
    color: Palette.onSurface,
    textAlign: "center",
  },
  footerText: {
    ...Typography.labelSm,
    color: Palette.onSurfaceVariant,
    textAlign: 'center',
    marginTop: Spacing.stackLg,
    textTransform: 'none',
    letterSpacing: 0.4,
    lineHeight: 18,
  },
  footerLink: {
    color: Palette.primary,
    textDecorationLine: "underline",
    fontFamily: FontFamilies.bodySemiBold,
  },
});
