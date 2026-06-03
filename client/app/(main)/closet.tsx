import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
          <ActivityIndicator color={Palette.primary} />
        ) : error ? (
          <Text>{error}</Text>
        ) : !user ? (
          <Text>Please sign in to view your closet.</Text>
        ) : items.length === 0 ? (
          <Text>No items found in your closet yet.</Text>
        ) : (
          <View>
            {items.map((item) => (
              <View key={item.id}>
                <Text>{item.category ?? "Unnamed item"}</Text>
                <Text>ID: {item.id}</Text>
              </View>
            ))}
          </View>
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
  },
});
