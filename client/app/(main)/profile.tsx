import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Palette } from "@/constants/design";
import { signOut } from "@/lib/auth";
import { getProfile, type UserProfile } from "@/lib/profile";
import { GenderPicker } from "@/components/profile/gender-picker";
import { styles } from "@/components/profile/profile-styles";
import {
  capitalize,
  getInitials,
  inchesToFeetAndInches,
} from "@/components/profile/profile-utils";
import { useProfileEdit } from "@/hooks/use-profile-edit";

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const edit = useProfileEdit(profile, (updated) => setProfile(updated));

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.centered}>
          <ActivityIndicator color={Palette.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            {error ?? "Could not load profile."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.wordmark}>FITTED</Text>
        {!edit.editing ? (
          <Pressable onPress={edit.startEditing} style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
        ) : (
          <View style={styles.editActions}>
            <Pressable onPress={edit.cancelEditing} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={edit.saveEditing}
              style={[
                styles.saveButton,
                edit.saving && styles.saveButtonDisabled,
              ]}
              disabled={edit.saving}
            >
              {edit.saving ? (
                <ActivityIndicator size="small" color={Palette.onPrimary} />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </Pressable>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>
              {getInitials(edit.editing ? edit.draftName : profile.name)}
            </Text>
          </View>
          {edit.editing ? (
            <TextInput
              style={styles.nameInput}
              value={edit.draftName}
              onChangeText={edit.setDraftName}
              placeholder="Full name"
              placeholderTextColor={Palette.onSurfaceVariant}
              autoCapitalize="words"
              returnKeyType="done"
            />
          ) : (
            <Text style={styles.name}>{profile.name}</Text>
          )}
          <Text style={styles.email}>{profile.email}</Text>
        </View>

        {/* Details bento */}
        <View style={styles.bentoGrid}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>EMAIL</Text>
            <Text style={styles.cardValue}>{profile.email}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>PASSWORD</Text>
            <Text style={styles.cardValue}>••••••••••</Text>
          </View>

          <View style={styles.bentoRow}>
            <View style={[styles.card, styles.cardHalf]}>
              <Text style={styles.cardLabel}>AGE</Text>
              {edit.editing ? (
                <TextInput
                  style={styles.fieldInput}
                  value={edit.draftAge}
                  onChangeText={edit.setDraftAge}
                  keyboardType="number-pad"
                  placeholder="—"
                  placeholderTextColor={Palette.onSurfaceVariant}
                  maxLength={3}
                  returnKeyType="done"
                />
              ) : (
                <Text style={styles.cardValue}>{String(profile.age)}</Text>
              )}
            </View>

            <View style={[styles.card, styles.cardHalf]}>
              <Text style={styles.cardLabel}>HEIGHT</Text>
              {edit.editing ? (
                <View style={styles.heightRow}>
                  <TextInput
                    style={[styles.fieldInput, styles.heightInput]}
                    value={edit.draftFeet}
                    onChangeText={edit.setDraftFeet}
                    keyboardType="number-pad"
                    placeholder="ft"
                    placeholderTextColor={Palette.onSurfaceVariant}
                    maxLength={1}
                    returnKeyType="next"
                  />
                  <Text style={styles.heightSep}>&apos;</Text>
                  <TextInput
                    style={[styles.fieldInput, styles.heightInput]}
                    value={edit.draftInches}
                    onChangeText={edit.setDraftInches}
                    keyboardType="number-pad"
                    placeholder="in"
                    placeholderTextColor={Palette.onSurfaceVariant}
                    maxLength={2}
                    returnKeyType="done"
                  />
                  <Text style={styles.heightSep}>&quot;</Text>
                </View>
              ) : (
                <Text style={styles.cardValue}>
                  {inchesToFeetAndInches(profile.height)}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>GENDER</Text>
            {edit.editing ? (
              <GenderPicker
                value={edit.draftGender}
                onChange={edit.setDraftGender}
              />
            ) : (
              <Text style={styles.cardValue}>{capitalize(profile.gender)}</Text>
            )}
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <View style={[styles.prefRow, styles.prefRowLast]}>
              <Text style={styles.prefKey}>System</Text>
              <Text style={styles.prefValue}>Imperial</Text>
            </View>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleSignOut}
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && styles.signOutButtonPressed,
          ]}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
