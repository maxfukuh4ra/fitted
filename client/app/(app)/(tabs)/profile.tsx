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

import { GenderPicker } from "@/components/profile/gender-picker";
import { styles } from "@/components/profile/profile-styles";
import { capitalize, getInitials } from "@/components/profile/profile-utils";
import { Palette, Typography } from "@/constants/design";
import { useProfileEdit } from "@/hooks/use-profile-edit";
import { signOut } from "@/lib/auth";
import { getProfile, type UserProfile } from "@/lib/profile";

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

  const heightFeet = Math.floor((profile.height ?? 0) / 12);
  const heightInches = (profile.height ?? 0) % 12;
  const fieldProps = {
    editable: edit.editing,
    showSoftInputOnFocus: edit.editing,
    caretHidden: !edit.editing,
    pointerEvents: edit.editing ? ("auto" as const) : ("none" as const),
    underlineColorAndroid: "transparent" as const,
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.topBar}>
        <Text style={styles.wordmark}>FITTED</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>
              {getInitials(edit.editing ? edit.draftName : profile.name)}
            </Text>
          </View>
          <View style={styles.nameSlot}>
            <View style={styles.nameField}>
              <TextInput
                {...fieldProps}
                style={[Typography.headlineMd, styles.nameInput]}
                value={edit.editing ? edit.draftName : profile.name}
                onChangeText={edit.setDraftName}
                selectTextOnFocus={edit.editing}
                placeholder="Full name"
                placeholderTextColor={Palette.onSurfaceVariant}
                autoCapitalize="words"
                returnKeyType="done"
              />
              <View
                style={[
                  styles.nameUnderlineWrap,
                  !edit.editing && styles.underlineHidden,
                ]}
              >
                <View style={styles.nameUnderline} />
              </View>
            </View>
          </View>
          <Text style={styles.email}>{profile.email}</Text>
        </View>

        <View style={styles.bentoGrid}>
          <View style={styles.bentoRow}>
            <View style={[styles.card, styles.cardHalf]}>
              <Text style={styles.cardLabel}>AGE</Text>
              <View style={styles.cardField}>
                <View style={[styles.inputWrap, styles.ageWrap]}>
                  <TextInput
                    {...fieldProps}
                    style={[Typography.titleLg, styles.fieldInput]}
                    value={edit.editing ? edit.draftAge : String(profile.age)}
                    onChangeText={edit.setDraftAge}
                    keyboardType="number-pad"
                    placeholder="—"
                    placeholderTextColor={Palette.onSurfaceVariant}
                    maxLength={3}
                    returnKeyType="done"
                  />
                  <View
                    style={[
                      styles.inputUnderline,
                      !edit.editing && styles.underlineHidden,
                    ]}
                  />
                </View>
              </View>
            </View>

            <View style={[styles.card, styles.cardHalf]}>
              <Text style={styles.cardLabel}>HEIGHT</Text>
              <View style={styles.cardField}>
                <View style={styles.heightRow}>
                  <View style={[styles.inputWrap, styles.feetWrap]}>
                    <TextInput
                      {...fieldProps}
                      style={[Typography.titleLg, styles.fieldInput]}
                      value={edit.editing ? edit.draftFeet : String(heightFeet)}
                      onChangeText={edit.setDraftFeet}
                      keyboardType="number-pad"
                      placeholder="ft"
                      placeholderTextColor={Palette.onSurfaceVariant}
                      maxLength={1}
                      returnKeyType="next"
                    />
                    <View
                      style={[
                        styles.inputUnderline,
                        !edit.editing && styles.underlineHidden,
                      ]}
                    />
                  </View>
                  <Text style={[Typography.titleLg, styles.heightSep]}>
                    &apos;
                  </Text>
                  <View style={[styles.inputWrap, styles.inchesWrap]}>
                    <TextInput
                      {...fieldProps}
                      style={[Typography.titleLg, styles.fieldInput]}
                      value={
                        edit.editing ? edit.draftInches : String(heightInches)
                      }
                      onChangeText={edit.setDraftInches}
                      keyboardType="number-pad"
                      placeholder="in"
                      placeholderTextColor={Palette.onSurfaceVariant}
                      maxLength={2}
                      returnKeyType="done"
                    />
                    <View
                      style={[
                        styles.inputUnderline,
                        !edit.editing && styles.underlineHidden,
                      ]}
                    />
                  </View>
                  <Text style={[Typography.titleLg, styles.heightSep]}>
                    &quot;
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>GENDER</Text>
            <View
              style={[styles.cardField, edit.editing && styles.genderField]}
            >
              {edit.editing ? (
                <GenderPicker
                  value={edit.draftGender}
                  onChange={edit.setDraftGender}
                />
              ) : (
                <Text style={[Typography.titleLg, styles.cardValue]}>
                  {capitalize(profile.gender)}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.profileActions}>
          {edit.editing ? (
            <>
              <Pressable
                onPress={edit.cancelEditing}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={edit.saveEditing}
                style={({ pressed }) => [
                  styles.saveButton,
                  edit.saving && styles.saveButtonDisabled,
                  pressed && !edit.saving && styles.buttonPressed,
                ]}
                disabled={edit.saving}
              >
                <View style={styles.saveButtonInner}>
                  {edit.saving ? (
                    <ActivityIndicator size="small" color={Palette.onPrimary} />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </View>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                onPress={edit.startEditing}
                style={({ pressed }) => [
                  styles.editProfileButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.editProfileButtonText}>Edit profile</Text>
              </Pressable>
              <Pressable
                onPress={handleSignOut}
                style={({ pressed }) => [
                  styles.signOutButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.signOutText}>Sign Out</Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
