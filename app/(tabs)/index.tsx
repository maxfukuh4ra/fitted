import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../../lib/supabase";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link } from "expo-router";

export default function HomeScreen() {
  // Auth state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);
  const [authError, setAuthError] = useState<string | null>(null);

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

  // Sign in handler
  const handleSignIn = async () => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setAuthError(error.message);
    else setUser(data.user);
  };

  useEffect(() => {
    supabase
      .from("items")
      .select("*")
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setItems(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      {/* Supabase items test display */}
      {/* Supabase Auth and Items Test Display */}
      <View style={{ padding: 16 }}>
        <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
          Supabase Items Table Test
        </Text>
        {!user && (
          <View>
            <Text>Email:</Text>
            <TextInput
              style={{ borderWidth: 1, marginBottom: 8, padding: 4 }}
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              placeholder="email"
            />
            <Text>Password:</Text>
            <TextInput
              style={{ borderWidth: 1, marginBottom: 8, padding: 4 }}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="password"
            />
            <Text
              style={{ color: "blue", marginBottom: 8 }}
              onPress={handleSignIn}
            >
              Sign In
            </Text>
            {authError && <Text style={{ color: "red" }}>{authError}</Text>}
          </View>
        )}
        {user && (
          <View>
            <Text>User: {user.email}</Text>
            {loading && <Text>Loading...</Text>}
            {error && <Text style={{ color: "red" }}>{error}</Text>}
            {!loading && !error && items.length === 0 && (
              <Text>No items found.</Text>
            )}
            {!loading && !error && items.length > 0 && (
              <View>
                {items.map((item) => (
                  <Text key={item.id}>
                    {item.category} - {item.id}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>{" "}
          to see changes. Press{" "}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: "cmd + d",
              android: "cmd + m",
              web: "F12",
            })}
          </ThemedText>{" "}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction
              title="Action"
              icon="cube"
              onPress={() => alert("Action pressed")}
            />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert("Share pressed")}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert("Delete pressed")}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">
            npm run reset-project
          </ThemedText>{" "}
          to get a fresh <ThemedText type="defaultSemiBold">app</ThemedText>{" "}
          directory. This will move the current{" "}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{" "}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
