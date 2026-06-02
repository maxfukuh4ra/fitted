import { useState } from "react";
import { Alert } from "react-native";
import { updateProfile, type UserProfile } from "@/lib/profile";

export function useProfileEdit(
  profile: UserProfile | null,
  setProfile: (p: UserProfile) => void
) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [draftName, setDraftName] = useState("");
  const [draftAge, setDraftAge] = useState("");
  const [draftFeet, setDraftFeet] = useState("");
  const [draftInches, setDraftInches] = useState("");
  const [draftGender, setDraftGender] = useState("");

  function startEditing() {
    if (!profile) return;
    setDraftName(profile.name ?? "");
    setDraftAge(profile.age != null ? String(profile.age) : "");
    const totalInches = profile.height ?? 0;
    setDraftFeet(String(Math.floor(totalInches / 12)));
    setDraftInches(String(totalInches % 12));
    setDraftGender(profile.gender ?? "");
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
  }

  async function saveEditing() {
    if (!profile) return;

    const age = parseInt(draftAge, 10);
    const feet = parseInt(draftFeet, 10);
    const inches = parseInt(draftInches, 10);

    if (!draftName.trim()) {
      Alert.alert("Validation", "Name cannot be empty.");
      return;
    }
    if (isNaN(age) || age < 1 || age > 120) {
      Alert.alert("Validation", "Enter a valid age (1–120).");
      return;
    }
    if (isNaN(feet) || feet < 0 || isNaN(inches) || inches < 0 || inches > 11) {
      Alert.alert("Validation", "Enter a valid height (inches must be 0–11).");
      return;
    }

    const totalInches = feet * 12 + inches;
    const updates = { name: draftName.trim(), age, height: totalInches, gender: draftGender };

    setSaving(true);
    try {
      await updateProfile(profile.id, updates);
      setProfile({ ...profile, ...updates });
      setEditing(false);
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return {
    editing,
    saving,
    draftName, setDraftName,
    draftAge, setDraftAge,
    draftFeet, setDraftFeet,
    draftInches, setDraftInches,
    draftGender, setDraftGender,
    startEditing,
    cancelEditing,
    saveEditing,
  };
}
