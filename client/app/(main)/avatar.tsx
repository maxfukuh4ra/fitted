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
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    new Set(),
  );
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

  const toggleItemSelection = (itemId: string) => {
    setSelectedItemIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(itemId)) {
        updated.delete(itemId);
      } else {
        updated.add(itemId);
      }
      return updated;
    });
  };

  const saveOutfit = async () => {
    console.log("Saving outfit with item IDs:", Array.from(selectedItemIds));
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
                          onPress={() => toggleItemSelection(item.id)}
                          style={[
                            styles.cardWrapper,
                            selectedItemIds.has(item.id) &&
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
                  (!user || selectedItemIds.size === 0 || saving) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={saveOutfit}
                disabled={!user || selectedItemIds.size === 0 || saving}
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
