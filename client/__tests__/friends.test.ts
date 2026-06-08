// Initial AI Prompt: Please generate some unit tests (vitest) to test friends functionality.
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  acceptFriendRequest,
  declineFriendRequest,
  getFriendsOutfits,
  getPendingRequests,
  listFriends,
  removeFriend,
  sendFriendRequest,
} from "../lib/friends";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  rpc: vi.fn(),
  from: vi.fn(),
}));

// need to mock supabase auth + rpc
vi.mock("../lib/supabase", () => ({
  supabase: {
    auth: { getSession: mocks.getSession },
    rpc: mocks.rpc,
    from: mocks.from,
  },
}));

const UID = "current-user-id";

// AI Usage: please refactor my code to reduce/abstract the repeated supabase calls
// Builds a supabase-style thenable chain: every builder method returns the
// same object so any call sequence eventually resolves to `result`.
function chain(result: unknown) {
  const obj: any = {
    then(resolve: (v: unknown) => void, reject?: (e: unknown) => void) {
      return Promise.resolve(result).then(resolve, reject);
    },
  };
  for (const m of [
    "select",
    "eq",
    "neq",
    "or",
    "in",
    "update",
    "delete",
    "insert",
    "order",
    "maybeSingle",
  ]) {
    obj[m] = () => obj;
  }
  return obj;
}

// AI Usage: there is stale data between each test, please fix by keeping each test modular and independent.
beforeEach(() => {
  vi.resetAllMocks();
  mocks.getSession.mockResolvedValue({
    data: { session: { user: { id: UID } } },
  });
});

// AI Usage: please add additional tests for rpc error, no user found, already friends, pending req, and success for sendFriendRequest
describe("lib/friends", () => {
  describe("sendFriendRequest", () => {
    it("throws when rpc errors", async () => {
      mocks.rpc.mockResolvedValue({
        data: null,
        error: { message: "rpc fail" },
      });
      await expect(sendFriendRequest("a@b.com")).rejects.toThrow("rpc fail");
    });

    it("throws 'No user found with that email.' when rpc returns empty", async () => {
      mocks.rpc.mockResolvedValue({ data: [], error: null });
      await expect(sendFriendRequest("nobody@example.com")).rejects.toThrow(
        "No user found with that email.",
      );
    });

    it("throws 'Already friends.' when accepted friendship exists", async () => {
      mocks.rpc.mockResolvedValue({ data: [{ id: "target-id" }], error: null });
      mocks.from.mockReturnValue(
        chain({ data: { status: "accepted" }, error: null }),
      );
      await expect(sendFriendRequest("a@b.com")).rejects.toThrow(
        "Already friends.",
      );
    });

    it("throws 'Friend request already pending.' for pending friendship", async () => {
      mocks.rpc.mockResolvedValue({ data: [{ id: "target-id" }], error: null });
      mocks.from.mockReturnValue(
        chain({ data: { status: "pending" }, error: null }),
      );
      await expect(sendFriendRequest("a@b.com")).rejects.toThrow(
        "Friend request already pending.",
      );
    });

    it("throws 'Already friends or request already pending.' on 23505 insert error", async () => {
      mocks.rpc.mockResolvedValue({ data: [{ id: "target-id" }], error: null });
      mocks.from
        .mockReturnValueOnce(chain({ data: null, error: null })) // maybeSingle: no existing
        .mockReturnValueOnce(
          chain({ error: { code: "23505", message: "dup" } }),
        ); // insert
      await expect(sendFriendRequest("a@b.com")).rejects.toThrow(
        "Already friends or request already pending.",
      );
    });

    it("resolves on successful insert", async () => {
      mocks.rpc.mockResolvedValue({ data: [{ id: "target-id" }], error: null });
      mocks.from
        .mockReturnValueOnce(chain({ data: null, error: null })) // maybeSingle: no existing
        .mockReturnValueOnce(chain({ error: null })); // insert succeeds
      await expect(sendFriendRequest("a@b.com")).resolves.toBeUndefined();
    });
  });

  describe("acceptFriendRequest", () => {
    it("resolves on success", async () => {
      mocks.from.mockReturnValue(chain({ error: null }));
      await expect(acceptFriendRequest("fid-1")).resolves.toBeUndefined();
    });

    it("throws on error", async () => {
      mocks.from.mockReturnValue(
        chain({ error: { message: "update failed" } }),
      );
      await expect(acceptFriendRequest("fid-1")).rejects.toThrow(
        "update failed",
      );
    });
  });

  describe("declineFriendRequest / removeFriend", () => {
    it("declineFriendRequest resolves on success", async () => {
      mocks.from.mockReturnValue(chain({ error: null }));
      await expect(declineFriendRequest("fid-1")).resolves.toBeUndefined();
    });

    it("removeFriend resolves on success", async () => {
      mocks.from.mockReturnValue(chain({ error: null }));
      await expect(removeFriend("fid-1")).resolves.toBeUndefined();
    });

    it("throws on delete error", async () => {
      mocks.from.mockReturnValue(
        chain({ error: { message: "delete failed" } }),
      );
      await expect(declineFriendRequest("fid-1")).rejects.toThrow(
        "delete failed",
      );
    });

    it("declineFriendRequest and removeFriend are the same function", () => {
      expect(declineFriendRequest).toBe(removeFriend);
    });
  });

  describe("listFriends", () => {
    it("returns empty array when no friendships", async () => {
      mocks.from.mockReturnValue(chain({ data: [], error: null }));
      expect(await listFriends()).toEqual([]);
    });

    it("throws on supabase error", async () => {
      mocks.from.mockReturnValue(
        chain({ data: null, error: { message: "db error" } }),
      );
      await expect(listFriends()).rejects.toThrow("db error");
    });

    it("maps direction 'sent' when current user is requester", async () => {
      mocks.from.mockReturnValue(
        chain({
          data: [{ id: "fid", requester_id: UID, addressee_id: "friend-id" }],
          error: null,
        }),
      );
      mocks.rpc.mockResolvedValue({
        data: [{ id: "friend-id", name: "Alice", email: "alice@example.com" }],
        error: null,
      });

      const result = await listFriends();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        friendshipId: "fid",
        userId: "friend-id",
        name: "Alice",
        email: "alice@example.com",
        direction: "sent",
      });
    });

    // AI Usage: even though friendship is bi-directional, the supabase table stores it as requester_id and addressee_id. Please test correct direction
    it("maps direction 'received' when current user is addressee", async () => {
      mocks.from.mockReturnValue(
        chain({
          data: [{ id: "fid", requester_id: "friend-id", addressee_id: UID }],
          error: null,
        }),
      );
      mocks.rpc.mockResolvedValue({
        data: [{ id: "friend-id", name: "Bob", email: "bob@example.com" }],
        error: null,
      });

      const result = await listFriends();

      expect(result[0].direction).toBe("received");
      expect(result[0].userId).toBe("friend-id");
    });

    it("falls back to 'Unknown' when user info is missing", async () => {
      mocks.from.mockReturnValue(
        chain({
          data: [{ id: "fid", requester_id: UID, addressee_id: "ghost-id" }],
          error: null,
        }),
      );
      mocks.rpc.mockResolvedValue({ data: [], error: null });

      const result = await listFriends();

      expect(result[0].name).toBe("Unknown");
      expect(result[0].email).toBeUndefined();
    });
  });

  describe("getPendingRequests", () => {
    it("returns empty array when no pending requests", async () => {
      mocks.from.mockReturnValue(chain({ data: [], error: null }));
      expect(await getPendingRequests()).toEqual([]);
    });

    it("throws on error", async () => {
      mocks.from.mockReturnValue(
        chain({ data: null, error: { message: "fail" } }),
      );
      await expect(getPendingRequests()).rejects.toThrow("fail");
    });

    it("maps requests with direction 'received'", async () => {
      mocks.from.mockReturnValue(
        chain({
          data: [{ id: "fid", requester_id: "requester-id" }],
          error: null,
        }),
      );
      mocks.rpc.mockResolvedValue({
        data: [
          { id: "requester-id", name: "Carol", email: "carol@example.com" },
        ],
        error: null,
      });

      const result = await getPendingRequests();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        friendshipId: "fid",
        userId: "requester-id",
        name: "Carol",
        email: "carol@example.com",
        direction: "received",
      });
    });

    it("falls back to 'Unknown' when user info is missing", async () => {
      mocks.from.mockReturnValue(
        chain({ data: [{ id: "fid", requester_id: "nobody" }], error: null }),
      );
      mocks.rpc.mockResolvedValue({ data: [], error: null });

      const result = await getPendingRequests();

      expect(result[0].name).toBe("Unknown");
    });
  });

  // AI Usage: getFriendsOutfits should fetch friends, then their outfits, then their outfit items (3 stage fetch)
  describe("getFriendsOutfits", () => {
    it("returns empty array when no outfits", async () => {
      mocks.from.mockImplementation((table: string) => {
        if (table === "friendships") return chain({ data: [], error: null });
        return chain({ data: [], error: null });
      });
      expect(await getFriendsOutfits()).toEqual([]);
    });

    it("throws on friendships fetch error", async () => {
      mocks.from.mockImplementation((table: string) => {
        if (table === "friendships")
          return chain({ data: null, error: { message: "err" } });
        return chain({ data: [], error: null });
      });
      await expect(getFriendsOutfits()).rejects.toThrow("err");
    });

    it("maps outfit items, image URLs, and user names correctly", async () => {
      const outfit = {
        id: "o1",
        name: "My Look",
        user_id: "friend-id",
        created_at: "2026-01-01T00:00:00Z",
        visibility: "Friends",
      };
      mocks.rpc.mockResolvedValue({
        data: [{ id: "friend-id", name: "Dave", email: "dave@example.com" }],
        error: null,
      });
      mocks.from.mockImplementation((table: string) => {
        if (table === "friendships")
          return chain({
            data: [{ requester_id: UID, addressee_id: "friend-id" }],
            error: null,
          });
        if (table === "outfits") return chain({ data: [outfit], error: null });
        if (table === "outfit_items")
          return chain({
            data: [{ outfit_id: "o1", slot: "top", item_id: "item-1" }],
            error: null,
          });
        if (table === "items")
          return chain({
            data: [
              { id: "item-1", image_url: "https://img.example.com/1.jpg" },
            ],
            error: null,
          });
        return chain({ data: [], error: null });
      });

      const result = await getFriendsOutfits();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "o1",
        name: "My Look",
        userId: "friend-id",
        userName: "Dave",
        visibility: "Friends",
        items: [
          {
            slot: "top",
            itemId: "item-1",
            imageUrl: "https://img.example.com/1.jpg",
          },
        ],
      });
    });

    it("sets imageUrl to null when item has no image", async () => {
      const outfit = {
        id: "o1",
        name: null,
        user_id: "friend-id",
        created_at: "2026-01-01T00:00:00Z",
        visibility: "Public",
      };
      mocks.rpc.mockResolvedValue({
        data: [{ id: "friend-id", name: "Eve", email: "e@e.com" }],
        error: null,
      });
      mocks.from.mockImplementation((table: string) => {
        if (table === "friendships") return chain({ data: [], error: null });
        if (table === "outfits") return chain({ data: [outfit], error: null });
        if (table === "outfit_items")
          return chain({
            data: [{ outfit_id: "o1", slot: "bottom", item_id: "item-2" }],
            error: null,
          });
        if (table === "items")
          return chain({
            data: [{ id: "item-2", image_url: null }],
            error: null,
          });
        return chain({ data: [], error: null });
      });

      const result = await getFriendsOutfits();

      expect(result[0].items[0].imageUrl).toBeNull();
    });

    it("returns empty items array when outfit has no outfit_items", async () => {
      const outfit = {
        id: "o1",
        name: "Empty",
        user_id: "friend-id",
        created_at: "2026-01-01T00:00:00Z",
        visibility: "Public",
      };
      mocks.rpc.mockResolvedValue({
        data: [{ id: "friend-id", name: "Frank", email: "f@f.com" }],
        error: null,
      });
      mocks.from.mockImplementation((table: string) => {
        if (table === "friendships") return chain({ data: [], error: null });
        if (table === "outfits") return chain({ data: [outfit], error: null });
        if (table === "outfit_items") return chain({ data: [], error: null });
        return chain({ data: [], error: null });
      });

      const result = await getFriendsOutfits();

      expect(result[0].items).toEqual([]);
    });
  });
});
