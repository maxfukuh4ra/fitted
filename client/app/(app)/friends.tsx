import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Palette, Radius, Spacing, Typography } from "@/constants/design";
import type { Friend, FriendOutfit } from "@/lib/friends";
import {
  acceptFriendRequest,
  declineFriendRequest,
  getFriendsOutfits,
  getPendingRequests,
  listFriends,
  removeFriend,
  sendFriendRequest,
} from "@/lib/friends";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {count !== undefined && count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
    </View>
  );
}

function OutfitCard({ outfit }: { outfit: FriendOutfit }) {
  const slotOrder = ["top", "bottom", "footwear"];
  const sorted = slotOrder
    .map((slot) => outfit.items.find((i) => i.slot === slot))
    .filter(Boolean) as FriendOutfit["items"];

  return (
    <View style={styles.outfitCard}>
      <View style={styles.outfitCardHeader}>
        <Text style={styles.outfitAuthor}>{outfit.userName}</Text>
        <Text style={styles.outfitTime}>{timeAgo(outfit.createdAt)}</Text>
      </View>
      {outfit.name && <Text style={styles.outfitName}>{outfit.name}</Text>}
      <View style={styles.outfitImages}>
        {sorted.map((item, i) =>
          item.imageUrl ? (
            <Image
              key={i}
              source={{ uri: item.imageUrl }}
              style={styles.outfitItemImage}
              contentFit="cover"
            />
          ) : (
            <View
              key={i}
              style={[styles.outfitItemImage, styles.outfitItemPlaceholder]}
            />
          ),
        )}
      </View>
    </View>
  );
}

export default function FriendsScreen() {
  const router = useRouter();
  const [pending, setPending] = useState<Friend[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [feed, setFeed] = useState<FriendOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);

  async function loadAll() {
    try {
      const [p, f, outfits] = await Promise.all([
        getPendingRequests(),
        listFriends(),
        getFriendsOutfits(),
      ]);
      setPending(p);
      setFriends(f);
      setFeed(outfits);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleAdd() {
    if (!email.trim()) return;
    setAddLoading(true);
    setAddError(null);
    setAddSuccess(false);
    try {
      await sendFriendRequest(email.trim());
      setEmail("");
      setAddSuccess(true);
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "Failed to send request.");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleAccept(friendshipId: string) {
    await acceptFriendRequest(friendshipId);
    await loadAll();
  }

  async function handleDecline(friendshipId: string) {
    await declineFriendRequest(friendshipId);
    setPending((prev) => prev.filter((f) => f.friendshipId !== friendshipId));
  }

  async function handleRemove(friendshipId: string) {
    await removeFriend(friendshipId);
    setFriends((prev) => prev.filter((f) => f.friendshipId !== friendshipId));
  }

  console.log(friends);
  console.log(pending);
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.backBtn}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={Palette.onSurface}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Friends</Text>
        <View style={styles.backBtn} />
      </View>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Palette.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Add friend */}
          <View style={styles.addSection}>
            <TextInput
              style={styles.emailInput}
              placeholder="Add by email"
              placeholderTextColor={Palette.onSurfaceVariant}
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setAddError(null);
                setAddSuccess(false);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="send"
              onSubmitEditing={handleAdd}
            />
            <Pressable
              style={[styles.addBtn, addLoading && styles.addBtnDisabled]}
              onPress={handleAdd}
              disabled={addLoading}
            >
              {addLoading ? (
                <ActivityIndicator size="small" color={Palette.onPrimary} />
              ) : (
                <MaterialIcons
                  name="person-add"
                  size={20}
                  color={Palette.onPrimary}
                />
              )}
            </Pressable>
          </View>
          {addError && <Text style={styles.addError}>{addError}</Text>}
          {addSuccess && (
            <Text style={styles.addSuccess}>Friend request sent!</Text>
          )}
          {/* Pending requests */}
          {pending.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Requests" count={pending.length} />
              {pending.map((req) => (
                <View key={req.friendshipId} style={styles.friendRow}>
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{req.name}</Text>
                    {req.email && (
                      <Text style={styles.friendEmail}>{req.email}</Text>
                    )}
                  </View>
                  <View style={styles.requestActions}>
                    <Pressable
                      style={styles.acceptBtn}
                      onPress={() => handleAccept(req.friendshipId)}
                    >
                      <MaterialIcons
                        name="check"
                        size={18}
                        color={Palette.onPrimary}
                      />
                    </Pressable>
                    <Pressable
                      style={styles.declineBtn}
                      onPress={() => handleDecline(req.friendshipId)}
                    >
                      <MaterialIcons
                        name="close"
                        size={18}
                        color={Palette.onSurfaceVariant}
                      />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
          {/* Friends list */}
          <View style={styles.section}>
            <SectionHeader title="Friends" />
            {friends.length === 0 ? (
              <Text style={styles.emptyText}>
                No friends yet. Add someone above.
              </Text>
            ) : (
              friends.map((f) => (
                <View key={f.friendshipId} style={styles.friendRow}>
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{f.name}</Text>
                    {f.email && (
                      <Text style={styles.friendEmail}>{f.email}</Text>
                    )}
                  </View>
                  <Pressable
                    onPress={() => handleRemove(f.friendshipId)}
                    hitSlop={8}
                    style={styles.removeBtn}
                  >
                    <MaterialIcons
                      name="person-remove"
                      size={18}
                      color={Palette.onSurfaceVariant}
                    />
                  </Pressable>
                </View>
              ))
            )}
          </View>
          {/* Feed */}
          {friends.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Their Outfits" />
              {feed.length === 0 ? (
                <Text style={styles.emptyText}>No shared outfits yet.</Text>
              ) : (
                <View style={styles.outfitGrid}>
                  {feed.map((outfit) => (
                    <OutfitCard key={outfit.id} outfit={outfit} />
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}
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
    justifyContent: "space-between",
    paddingHorizontal: Spacing.containerMargin,
    paddingVertical: Spacing.stackMd,
    backgroundColor: Palette.surfaceContainerLowest,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  backBtn: {
    width: 32,
    alignItems: "center",
  },
  headerTitle: {
    ...Typography.titleLg,
    color: Palette.onSurface,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.containerMargin,
    gap: Spacing.stackMd,
  },
  addSection: {
    flexDirection: "row",
    gap: Spacing.stackSm,
  },
  emailInput: {
    flex: 1,
    ...Typography.bodyMd,
    color: Palette.onSurface,
    borderWidth: 1,
    borderColor: Palette.outlineVariant,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.stackMd,
    paddingVertical: Spacing.stackSm,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnDisabled: { opacity: 0.5 },
  addError: {
    ...Typography.bodyMd,
    color: Palette.error,
    marginTop: -Spacing.stackSm,
  },
  addSuccess: {
    ...Typography.bodyMd,
    color: Palette.primary,
    marginTop: -Spacing.stackSm,
  },
  section: { gap: Spacing.stackSm },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.stackSm,
    paddingBottom: 4,
  },
  sectionTitle: {
    ...Typography.titleLg,
    color: Palette.onSurface,
  },
  badge: {
    backgroundColor: Palette.primary,
    borderRadius: Radius.full,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    ...Typography.labelSm,
    color: Palette.onPrimary,
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.stackSm,
    paddingVertical: Spacing.stackSm,
    borderBottomWidth: 1,
    borderBottomColor: Palette.outlineVariant,
  },
  friendAvatar: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Palette.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  friendAvatarText: {
    ...Typography.bodyMd,
    color: Palette.onSurface,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    ...Typography.bodyMd,
    color: Palette.onSurface,
  },
  friendEmail: {
    ...Typography.labelSm,
    color: Palette.onSurfaceVariant,
  },
  requestActions: {
    flexDirection: "row",
    gap: Spacing.stackSm,
  },
  acceptBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  declineBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Palette.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtn: {
    padding: 4,
  },
  emptyText: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
    paddingVertical: Spacing.stackSm,
  },
  outfitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.stackSm,
  },
  outfitCard: {
    width: "48%",
    backgroundColor: Palette.surfaceContainerLowest,
    borderRadius: Radius.lg,
    padding: Spacing.stackMd,
    gap: Spacing.stackSm,
    borderWidth: 1,
    borderColor: Palette.outlineVariant,
  },
  outfitCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  outfitAuthor: {
    ...Typography.bodyMd,
    color: Palette.onSurface,
  },
  outfitTime: {
    ...Typography.labelSm,
    color: Palette.onSurfaceVariant,
  },
  outfitName: {
    ...Typography.bodyMd,
    color: Palette.onSurfaceVariant,
  },
  outfitImages: {
    flexDirection: "column",
    gap: Spacing.stackSm,
    alignSelf: "flex-start",
  },
  outfitItemImage: {
    width: 72,
    aspectRatio: 3 / 4,
    borderRadius: Radius.md,
    backgroundColor: Palette.surfaceContainerLow,
  },
  outfitItemPlaceholder: {
    backgroundColor: Palette.surfaceContainerLow,
  },
});
