import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
  friendName: {
    ...Typography.bodyMd,
    color: Palette.onSurface,
    flex: 1,
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
  outfitCard: {
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
    flexDirection: "row",
    gap: Spacing.stackSm,
  },
  outfitItemImage: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: Radius.md,
    backgroundColor: Palette.surfaceContainerLow,
  },
  outfitItemPlaceholder: {
    backgroundColor: Palette.surfaceContainerLow,
  },
});
