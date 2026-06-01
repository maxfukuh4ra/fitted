import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Palette, Radius, Spacing, Typography } from "@/constants/design";
import { getProfile, type UserProfile } from "@/lib/profile";

function inchesToFeetAndInches(totalInches: number | null | undefined): string {
  if (totalInches == null) return "—";
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}"`;
}

function capitalize(s: string | null | undefined): string {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

function InfoCard({
  label,
  value,
  fullWidth = true,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <View style={[styles.card, fullWidth ? styles.cardFull : styles.cardHalf]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);


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
      <View style={styles.topBar}>
        <Text style={styles.wordmark}>FITTED</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>
              {getInitials(profile.name)}
            </Text>
          </View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.email}>{profile.email}</Text>
        </View>

        {/* Details Bento */}
        <View style={styles.bentoGrid}>
          <InfoCard label="EMAIL" value={profile.email} />
          <InfoCard label="PASSWORD" value="••••••••••" />
          <View style={styles.bentoRow}>
            <InfoCard
              label="AGE"
              value={String(profile.age)}
              fullWidth={false}
            />
            <InfoCard
              label="HEIGHT"
              value={inchesToFeetAndInches(profile.height)}
              fullWidth={false}
            />
          </View>
          <InfoCard label="GENDER" value={capitalize(profile.gender)} />
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <View style={styles.prefRow}>
              <Text style={styles.prefKey}>System</Text>
              <Text style={styles.prefValue}>Imperial</Text>
            </View>
            <View style={[styles.prefRow, styles.prefRowLast]}>
              <Text style={styles.prefKey}>Currency</Text>
              <Text style={styles.prefValue}>USD ($)</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topBar: {
    alignItems: "center",
    paddingVertical: Spacing.stackMd,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Palette.outlineVariant,
  },
  wordmark: {
    ...Typography.labelSm,
    color: Palette.onSurface,
    letterSpacing: 6,
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.stackLg,
    paddingBottom: Spacing.stackXl,
    gap: Spacing.stackLg,
  },

  // Profile header
  profileHeader: {
    alignItems: "center",
    gap: Spacing.stackSm,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: Radius.full,
    backgroundColor: Palette.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.stackSm,
  },
  avatarInitials: {
    ...Typography.headlineMd,
    color: Palette.onSurface,
  },
  name: {
    ...Typography.headlineMd,
    color: Palette.onSurface,
  },
  email: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
  },

  // Bento grid
  bentoGrid: {
    gap: Spacing.gutter,
  },
  bentoRow: {
    flexDirection: "row",
    gap: Spacing.gutter,
  },
  card: {
    backgroundColor: Palette.surfaceContainer,
    borderRadius: Radius.lg,
    padding: Spacing.stackLg,
  },
  cardFull: {
    // default: full width
  },
  cardHalf: {
    flex: 1,
  },
  cardLabel: {
    ...Typography.labelSm,
    color: Palette.onSurfaceVariant,
    marginBottom: Spacing.stackSm,
  },
  cardValue: {
    ...Typography.titleLg,
    color: Palette.onSurface,
  },

  // Preferences
  section: {
    gap: Spacing.stackMd,
  },
  sectionTitle: {
    ...Typography.headlineMd,
    color: Palette.onSurface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Palette.surfaceVariant,
    paddingBottom: Spacing.stackSm,
  },
  prefRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.stackMd,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Palette.outlineVariant,
  },
  prefRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  prefKey: {
    ...Typography.bodyMd,
    color: Palette.onSurface,
  },
  prefValue: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
  },

  errorText: {
    ...Typography.bodyMd,
    color: Palette.error,
    textAlign: "center",
    paddingHorizontal: Spacing.containerMargin,
  },
});
