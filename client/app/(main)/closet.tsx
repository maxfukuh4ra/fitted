import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ClosetItemCard } from "@/components/closet/ClosetItemCard";
import { Palette, Spacing, Typography } from "@/constants/design";
import { supabase } from "@/lib/supabase";

export default function ClosetScreen() {
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.screen}>
        <Text style={styles.title}>My Closet</Text>

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
            Please sign in to view your closet.
          </Text>
        ) : items.length === 0 ? (
          <Text style={styles.messageText}>
            No items found in your closet yet.
          </Text>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {items.map((item) => (
              <ClosetItemCard
                key={item.id}
                id={item.id}
                name={item.name}
                category={item.category}
                subcategory={item.subcategory}
                imageUrl={item.image_url}
              />
            ))}
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
  listContent: {
    paddingBottom: Spacing.stackXl,
  },
});
