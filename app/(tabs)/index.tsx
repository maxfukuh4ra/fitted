import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  FontFamilies,
  LandingAssets,
  Palette,
  Radius,
  Spacing,
  Typography,
} from '@/constants/design';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
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

  // Check for user on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (data?.user) setUser(data.user);
    });
  }, []);

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

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setAuthError(signInError.message);
      return;
    }

    setUser(data.user);
  };

  const handleSignUp = async () => {
    setAuthError(null);
    setAuthMessage(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setAuthError(signUpError.message);
      return;
    }

    if (data.user) {
      setUser(data.user);
      setAuthMessage('Account created. Check your email if confirmation is required.');
    }
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
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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

              {!user ? (
                <View style={styles.authSection}>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Email</Text>
                    <TextInput
                      autoCapitalize="none"
                      autoComplete="email"
                      keyboardType="email-address"
                      onChangeText={setEmail}
                      placeholder="you@example.com"
                      placeholderTextColor={Palette.onSurfaceVariant}
                      style={styles.input}
                      value={email}
                    />
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Password</Text>
                    <TextInput
                      autoCapitalize="none"
                      autoComplete="password"
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor={Palette.onSurfaceVariant}
                      secureTextEntry
                      style={styles.input}
                      value={password}
                    />
                  </View>

                  <View style={styles.actionStack}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={handleSignUp}
                      style={({ pressed }) => [
                        styles.primaryButton,
                        pressed && styles.buttonPressed,
                      ]}
                    >
                      <Text style={styles.primaryButtonText}>Create Account</Text>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      onPress={handleSignIn}
                      style={({ pressed }) => [
                        styles.secondaryButton,
                        pressed && styles.secondaryButtonPressed,
                      ]}
                    >
                      <Text style={styles.secondaryButtonText}>Sign In</Text>
                    </Pressable>
                  </View>

                  {authError ? <Text style={styles.errorText}>{authError}</Text> : null}
                  {authMessage ? <Text style={styles.messageText}>{authMessage}</Text> : null}
                </View>
              ) : (
                <View style={styles.authSection}>
                  <Text style={styles.signedInLabel}>Signed in as</Text>
                  <Text style={styles.signedInEmail}>{user.email}</Text>

                  {loading ? (
                    <ActivityIndicator color={Palette.primary} style={styles.loader} />
                  ) : null}
                  {error ? <Text style={styles.errorText}>{error}</Text> : null}
                  {!loading && !error && items.length === 0 ? (
                    <Text style={styles.emptyStateText}>No items found.</Text>
                  ) : null}
                  {!loading && !error && items.length > 0 ? (
                    <View style={styles.itemsList}>
                      {items.map((item) => (
                        <Text key={item.id} style={styles.itemText}>
                          {item.category} - {item.id}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              )}

              <Text style={styles.footerText}>
                By continuing, you agree to our{' '}
                <Text style={styles.footerLink}>Terms</Text> and{' '}
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
    backgroundColor: 'rgba(251, 249, 249, 0.72)',
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.containerMargin,
    paddingVertical: Spacing.stackLg,
  },
  card: {
    width: '100%',
    maxWidth: 448,
    alignSelf: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.stackXl,
  },
  brandTitle: {
    ...Typography.displayLg,
    color: Palette.primary,
    letterSpacing: 8,
    textTransform: 'uppercase',
    marginBottom: Spacing.stackSm,
  },
  brandTagline: {
    ...Typography.labelSm,
    color: Palette.onSurfaceVariant,
    letterSpacing: 2.4,
  },
  authSection: {
    width: '100%',
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
  input: {
    ...Typography.bodyMd,
    height: 52,
    borderWidth: 1,
    borderColor: Palette.outlineVariant,
    borderRadius: Radius.md,
    backgroundColor: Palette.surfaceContainerLowest,
    color: Palette.onSurface,
    paddingHorizontal: Spacing.stackMd,
  },
  actionStack: {
    gap: Spacing.stackMd,
    marginTop: Spacing.stackSm,
  },
  primaryButton: {
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
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
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.outlineVariant,
    backgroundColor: Palette.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
  },
  messageText: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
    textAlign: 'center',
  },
  signedInLabel: {
    ...Typography.labelSm,
    color: Palette.onSurfaceVariant,
    textAlign: 'center',
  },
  signedInEmail: {
    ...Typography.titleLg,
    color: Palette.onSurface,
    textAlign: 'center',
  },
  loader: {
    marginTop: Spacing.stackSm,
  },
  emptyStateText: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
    textAlign: 'center',
  },
  itemsList: {
    gap: Spacing.stackSm,
    marginTop: Spacing.stackSm,
  },
  itemText: {
    ...Typography.bodyMd,
    color: Palette.onSurface,
    textAlign: 'center',
  },
  footerText: {
    ...Typography.labelSm,
    color: Palette.onSurfaceVariant,
    textAlign: 'center',
    marginTop: Spacing.stackXl,
    textTransform: 'none',
    letterSpacing: 0.4,
    lineHeight: 18,
  },
  footerLink: {
    color: Palette.primary,
    textDecorationLine: 'underline',
    fontFamily: FontFamilies.bodySemiBold,
  },
});
