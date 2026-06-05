import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { SelectableClosetCard } from "@/components/log-outfit/selectable-closet-card";
import { Palette, Radius, Spacing, Typography } from "@/constants/design";
import { useCloset } from "@/hooks/use-closet";
import { formatWornOn, recordWear } from "@/lib/wear-log";
import type { ClosetItem } from "@/lib/types/closet";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getWornOnParam(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const today = new Date();
  return formatWornOn(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
}

function formatDateLabel(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

export default function LogOutfitScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ wornOn?: string }>();
  const wornOn = useMemo(() => getWornOnParam(params.wornOn), [params.wornOn]);

  const { filteredItems, loading, error } = useCloset();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (selected.size === 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      await recordWear(wornOn, [...selected]);
      router.back();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <View style={styles.headerSide}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="arrow-back" size={24} color={Palette.onSurface} />
          </Pressable>
        </View>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.heading}>Log outfit</Text>
        </View>

        <View style={styles.headerSide} />
      </View>

      <Text style={styles.dateLabel}>Worn on {formatDateLabel(wornOn)}</Text>

      <Text style={styles.hint}>Tap items you wore together.</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {saveError ? <Text style={styles.error}>{saveError}</Text> : null}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Palette.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item: ClosetItem) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <SelectableClosetCard
                item={item}
                selected={selected.has(item.id)}
                onPress={() => toggleItem(item.id)}
              />
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>Add clothes to your closet first.</Text>
          }
        />
      )}

      <View
        pointerEvents="box-none"
        style={[styles.doneWrap, { bottom: insets.bottom + Spacing.stackMd }]}
      >
        <Pressable
          style={[
            styles.doneBtn,
            (selected.size === 0 || saving) && styles.doneBtnDisabled,
          ]}
          disabled={selected.size === 0 || saving}
          onPress={handleSave}
        >
          <Text style={styles.doneText}>
            {saving ? "Saving…" : `Done (${selected.size})`}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.stackMd,
    paddingBottom: Spacing.stackSm,
  },
  headerSide: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnPressed: {
    backgroundColor: Palette.surfaceContainerLow,
  },
  heading: {
    ...Typography.headlineMd,
    fontSize: 22,
    lineHeight: 28,
    color: Palette.onSurface,
    textAlign: "center",
  },
  dateLabel: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
    paddingHorizontal: Spacing.containerMargin,
    marginTop: Spacing.stackSm,
  },
  hint: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
    paddingHorizontal: Spacing.containerMargin,
    marginBottom: Spacing.stackMd,
  },
  list: {
    paddingHorizontal: Spacing.containerMargin,
    paddingBottom: 100,
  },
  row: {
    gap: Spacing.gutter,
    marginBottom: Spacing.gutter,
  },
  gridItem: {
    flex: 1,
  },
  doneWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.containerMargin,
  },
  doneBtn: {
    height: 52,
    borderRadius: Radius.lg,
    backgroundColor: Palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtnDisabled: {
    opacity: 0.4,
  },
  doneText: {
    ...Typography.labelSm,
    color: Palette.onPrimary,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    ...Typography.bodyMd,
    color: Palette.error,
    paddingHorizontal: Spacing.containerMargin,
    marginBottom: Spacing.stackSm,
  },
  empty: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
    textAlign: "center",
    paddingVertical: Spacing.stackXl,
  },
});
