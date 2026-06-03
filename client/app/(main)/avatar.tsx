import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ClosetItemCard } from "@/components/closet/ClosetItemCard";
import { Palette, Spacing, Typography } from "@/constants/design";
import { supabase } from "@/lib/supabase";

const SECTIONS = [
  { title: "Tops", category: "tops" },
  { title: "Bottoms", category: "bottoms" },
  { title: "Shoes", category: "shoes" },
] as const;

export default function AvatarScreen() {
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<
    Record<string, string>
  >({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    supabase
      .from("items")
      .select("*")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          setItems([]);
        } else {
          setItems(data || []);
          setError(null);
        }
        setLoading(false);
      });
  }, [user]);

  const toggleItemSelection = (itemId: string, category: string) => {
    setSelectedItemIds((prev) => {
      if (prev[category] === itemId) {
        const { [category]: _, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [category]: itemId,
      };
    });
  };

  const saveOutfit = async () => {
    if (!user || Object.keys(selectedItemIds).length !== SECTIONS.length)
      return;

    setSaving(true);
    try {
      // Create outfit
      const { data: outfitData, error: outfitError } = await supabase
        .from("outfits")
        .insert([{ user_id: user.id }])
        .select();

      if (outfitError) throw outfitError;

      const outfitId = outfitData?.[0]?.id;
      if (!outfitId) throw new Error("Failed to create outfit");

      // Create outfit items with slot metadata
      const outfitItems = Object.entries(selectedItemIds).map(
        ([category, itemId]) => ({
          outfit_id: outfitId,
          item_id: itemId,
          slot: category,
        }),
      );

      const { error: itemsError } = await supabase
        .from("outfit_items")
        .insert(outfitItems);

      if (itemsError) throw itemsError;

      // Reset selection
      setSelectedItemIds({});
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save outfit");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.screen}>
        <Text style={styles.title}>Avatar Creator</Text>

        {loading ? (
          <ActivityIndicator
            color={Palette.primary}
            size="large"
            style={styles.loader}
          />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : !user ? (
          <Text style={styles.messageText}>
            Please sign in to view your closet items.
          </Text>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {SECTIONS.map((section) => {
              const sectionItems = items.filter(
                (item) => item.category === section.category,
              );

              return (
                <View key={section.category} style={styles.section}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.sectionList}
                  >
                    {sectionItems.length > 0 ? (
                      sectionItems.map((item) => (
                        <Pressable
                          key={item.id}
                          onPress={() =>
                            toggleItemSelection(item.id, item.category)
                          }
                          style={[
                            styles.cardWrapper,
                            selectedItemIds[item.category] === item.id &&
                              styles.cardWrapperSelected,
                          ]}
                        >
                          <ClosetItemCard
                            id={item.id}
                            name={item.name}
                            category={item.category}
                            subcategory={item.subcategory}
                            imageUrl={item.image_url}
                            style={styles.horizontalCard}
                          />
                        </Pressable>
                      ))
                    ) : (
                      <View style={styles.emptySection}>
                        <Text style={styles.emptyText}>
                          No {section.title.toLowerCase()} in your closet yet.
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              );
            })}

            <View style={styles.submitContainer}>
              <Pressable
                style={[
                  styles.submitButton,
                  (!user ||
                    Object.keys(selectedItemIds).length !== SECTIONS.length ||
                    saving) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={saveOutfit}
                disabled={
                  !user ||
                  Object.keys(selectedItemIds).length !== SECTIONS.length ||
                  saving
                }
              >
                <Text style={styles.submitButtonText}>
                  {saving ? "Saving..." : "Save Outfit"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  screen: {
    flex: 1,
    backgroundColor: Palette.background,
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.containerMargin,
  },
  title: {
    ...Typography.headlineMd,
    color: Palette.onSurface,
    marginBottom: Spacing.stackMd,
  },
  loader: {
    marginTop: Spacing.stackLg,
  },
  errorText: {
    ...Typography.bodyMd,
    color: Palette.error,
    marginTop: Spacing.stackMd,
  },
  messageText: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
    marginTop: Spacing.stackMd,
  },
  scrollContent: {
    paddingBottom: Spacing.stackXl,
  },
  section: {
    marginBottom: Spacing.stackLg,
  },
  sectionTitle: {
    ...Typography.titleLg,
    color: Palette.onSurface,
    marginBottom: Spacing.stackMd,
  },
  sectionList: {
    paddingRight: Spacing.containerMargin,
  },
  horizontalCard: {
    width: 180,
    marginRight: Spacing.stackMd,
  },
  emptySection: {
    minHeight: 240,
    justifyContent: "center",
  },
  emptyText: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
  },
  cardWrapper: {
    marginRight: Spacing.stackMd,
  },
  cardWrapperSelected: {
    opacity: 0.6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Palette.primary,
  },
  submitContainer: {
    marginTop: Spacing.stackLg,
    paddingVertical: Spacing.stackMd,
  },
  submitButton: {
    backgroundColor: Palette.primary,
    paddingVertical: Spacing.stackMd,
    paddingHorizontal: Spacing.containerMargin,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: Palette.surfaceContainerHigh,
    opacity: 0.5,
  },
  submitButtonText: {
    ...Typography.titleLg,
    color: Palette.onPrimary,
  },
});
