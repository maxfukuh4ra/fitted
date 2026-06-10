// [GenAI Use] Prompt:
// "Write unit tests for lib/collections.ts. Mock Supabase like friends.test.ts.
// Cover slotted vs bucket outfits, mapping, createCollection, addItemsToCollection, deleteCollection."
// [GenAI Use] LLM Response Start
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  addItemsToCollection,
  addOutfitToCollections,
  createCollection,
  deleteCollection,
  fetchCollectionDetail,
  fetchCollections,
  removeItemFromCollection,
  removeOutfitFromCollection,
} from "../lib/collections";
import type { ClosetItem } from "../lib/types/closet";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock("../lib/supabase", () => ({
  supabase: { from: mocks.from },
}));

const UID = "user-123";
const COLLECTION_ID = "col-1";

function chain(result: unknown) {
  const obj: any = {
    then(resolve: (v: unknown) => void, reject?: (e: unknown) => void) {
      return Promise.resolve(result).then(resolve, reject);
    },
  };
  for (const m of [
    "select",
    "eq",
    "order",
    "single",
    "insert",
    "delete",
    "in",
  ]) {
    obj[m] = () => obj;
  }
  return obj;
}

function makeItem(id: string, overrides: Partial<ClosetItem> = {}): ClosetItem {
  return {
    id,
    user_id: UID,
    category: "Top",
    subcategory: "Shirt",
    item_name: `Item ${id}`,
    image_url: `https://img/${id}.jpg`,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeSlottedOutfit(id = "outfit-slotted") {
  return {
    id,
    name: "Saved Look",
    outfit_items: [
      {
        slot: "top",
        item_id: "item-1",
        items: makeItem("item-1"),
      },
    ],
  };
}

function makeBucketOutfit(id = "outfit-bucket") {
  return {
    id,
    name: "Favorites",
    outfit_items: [
      {
        slot: null,
        item_id: "item-2",
        items: makeItem("item-2"),
      },
    ],
  };
}

function makeCollectionRow(
  outfits: unknown[],
  overrides: Record<string, unknown> = {},
) {
  return {
    id: COLLECTION_ID,
    user_id: UID,
    name: "Favorites",
    is_favorite: false,
    collection_outfits: outfits.map((outfit) => ({ outfits: outfit })),
    ...overrides,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("fetchCollections", () => {
  it("throws on supabase error", async () => {
    mocks.from.mockReturnValue(
      chain({ data: null, error: { message: "fetch failed" } }),
    );

    await expect(fetchCollections(UID)).rejects.toThrow("fetch failed");
  });

  it("maps slotted outfits to outfit_count and all items to item_count", async () => {
    mocks.from.mockReturnValue(
      chain({
        data: [makeCollectionRow([makeSlottedOutfit(), makeBucketOutfit()])],
        error: null,
      }),
    );

    const result = await fetchCollections(UID);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: COLLECTION_ID,
      outfit_count: 1,
      item_count: 2,
      thumbnail_urls: ["https://img/item-1.jpg", "https://img/item-2.jpg"],
    });
  });

  it("caps thumbnail_urls at four images", async () => {
    const bucket = {
      id: "bucket-many",
      name: "Favorites",
      outfit_items: Array.from({ length: 5 }, (_, i) => ({
        slot: null,
        item_id: `item-${i}`,
        items: makeItem(`item-${i}`),
      })),
    };

    mocks.from.mockReturnValue(
      chain({ data: [makeCollectionRow([bucket])], error: null }),
    );

    const result = await fetchCollections(UID);

    expect(result[0].item_count).toBe(5);
    expect(result[0].thumbnail_urls).toHaveLength(4);
  });
});

describe("fetchCollectionDetail", () => {
  it("throws on supabase error", async () => {
    mocks.from.mockReturnValue(
      chain({ data: null, error: { message: "detail failed" } }),
    );

    await expect(fetchCollectionDetail(COLLECTION_ID)).rejects.toThrow(
      "detail failed",
    );
  });

  it("returns slotted outfits only and dedupes items across outfits", async () => {
    const sharedItem = makeItem("shared");
    const row = makeCollectionRow([
      {
        id: "outfit-a",
        name: "Look A",
        outfit_items: [
          { slot: "top", item_id: "shared", items: sharedItem },
        ],
      },
      {
        id: "outfit-b",
        name: "Look B",
        outfit_items: [
          { slot: "bottom", item_id: "shared", items: sharedItem },
          { slot: "shoes", item_id: "item-shoes", items: makeItem("item-shoes") },
        ],
      },
      makeBucketOutfit(),
    ]);

    mocks.from.mockReturnValue(chain({ data: row, error: null }));

    const result = await fetchCollectionDetail(COLLECTION_ID);

    expect(result.outfit_count).toBe(2);
    expect(result.item_count).toBe(3);
    expect(result.outfits).toHaveLength(2);
    expect(result.items).toHaveLength(3);
    expect(result.outfits[0].items[0]).toMatchObject({
      slot: "top",
      item: expect.objectContaining({ id: "shared" }),
    });
  });

  it("excludes bucket outfits from the outfits list", async () => {
    mocks.from.mockReturnValue(
      chain({
        data: makeCollectionRow([makeBucketOutfit()]),
        error: null,
      }),
    );

    const result = await fetchCollectionDetail(COLLECTION_ID);

    expect(result.outfit_count).toBe(0);
    expect(result.item_count).toBe(1);
    expect(result.outfits).toEqual([]);
    expect(result.items).toHaveLength(1);
  });
});

describe("createCollection", () => {
  it("throws when name is blank", async () => {
    await expect(createCollection(UID, "   ")).rejects.toThrow(
      "Collection name is required.",
    );
  });

  it("creates a collection without items", async () => {
    mocks.from.mockReturnValue(
      chain({
        data: [
          {
            id: COLLECTION_ID,
            user_id: UID,
            name: "New",
            is_favorite: false,
          },
        ],
        error: null,
      }),
    );

    const result = await createCollection(UID, "New");

    expect(result).toMatchObject({
      id: COLLECTION_ID,
      name: "New",
      outfit_count: 0,
      item_count: 0,
      thumbnail_urls: [],
    });
  });

  it("creates a bucket outfit when initial items are provided", async () => {
    mocks.from
      .mockReturnValueOnce(
        chain({
          data: [
            {
              id: COLLECTION_ID,
              user_id: UID,
              name: "Packed",
              is_favorite: false,
            },
          ],
          error: null,
        }),
      )
      .mockReturnValueOnce(chain({ data: [{ id: "outfit-new" }], error: null }))
      .mockReturnValueOnce(chain({ error: null }))
      .mockReturnValueOnce(chain({ error: null }))
      .mockReturnValueOnce(
        chain({
          data: [{ image_url: "https://img/a.jpg" }, { image_url: null }],
          error: null,
        }),
      );

    const result = await createCollection(UID, "Packed", ["item-a", "item-b"]);

    expect(result).toMatchObject({
      item_count: 2,
      outfit_count: 0,
      thumbnail_urls: ["https://img/a.jpg"],
    });
  });
});

describe("addOutfitToCollections", () => {
  it("no-ops when collectionIds is empty", async () => {
    await addOutfitToCollections("outfit-1", []);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("inserts collection_outfit links", async () => {
    mocks.from.mockReturnValue(chain({ error: null }));

    await expect(
      addOutfitToCollections("outfit-1", ["col-a", "col-b"]),
    ).resolves.toBeUndefined();
  });

  it("throws on insert error", async () => {
    mocks.from.mockReturnValue(
      chain({ error: { message: "link failed" } }),
    );

    await expect(
      addOutfitToCollections("outfit-1", ["col-a"]),
    ).rejects.toThrow("link failed");
  });
});

describe("removeOutfitFromCollection", () => {
  it("resolves on success", async () => {
    mocks.from.mockReturnValue(chain({ error: null }));
    await expect(
      removeOutfitFromCollection(COLLECTION_ID, "outfit-1"),
    ).resolves.toBeUndefined();
  });

  it("throws on delete error", async () => {
    mocks.from.mockReturnValue(
      chain({ error: { message: "remove outfit failed" } }),
    );

    await expect(
      removeOutfitFromCollection(COLLECTION_ID, "outfit-1"),
    ).rejects.toThrow("remove outfit failed");
  });
});

describe("removeItemFromCollection", () => {
  it("no-ops when the collection has no linked outfits", async () => {
    mocks.from.mockReturnValueOnce(chain({ data: [], error: null }));

    await removeItemFromCollection(COLLECTION_ID, "item-1");

    expect(mocks.from).toHaveBeenCalledTimes(1);
  });

  it("deletes outfit_items for linked outfits", async () => {
    mocks.from
      .mockReturnValueOnce(
        chain({ data: [{ outfit_id: "outfit-1" }], error: null }),
      )
      .mockReturnValueOnce(chain({ error: null }));

    await expect(
      removeItemFromCollection(COLLECTION_ID, "item-1"),
    ).resolves.toBeUndefined();
  });
});

describe("addItemsToCollection", () => {
  it("no-ops when itemIds is empty", async () => {
    await addItemsToCollection(COLLECTION_ID, UID, "Favorites", []);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("reuses an existing bucket outfit and skips duplicate item ids", async () => {
    mocks.from
      .mockReturnValueOnce(
        chain({ data: [{ outfit_id: "bucket-1" }], error: null }),
      )
      .mockReturnValueOnce(
        chain({
          data: [{ outfit_id: "saved-1", slot: "top" }],
          error: null,
        }),
      )
      .mockReturnValueOnce(
        chain({ data: [{ item_id: "item-1" }], error: null }),
      )
      .mockReturnValueOnce(chain({ error: null }));

    await addItemsToCollection(COLLECTION_ID, UID, "Favorites", [
      "item-1",
      "item-2",
    ]);

    expect(mocks.from).toHaveBeenCalledTimes(4);
  });

  it("creates a bucket outfit when none exists", async () => {
    mocks.from
      .mockReturnValueOnce(chain({ data: [], error: null }))
      .mockReturnValueOnce(
        chain({ data: [{ id: "bucket-new" }], error: null }),
      )
      .mockReturnValueOnce(chain({ error: null }))
      .mockReturnValueOnce(chain({ data: [], error: null }))
      .mockReturnValueOnce(chain({ error: null }));

    await expect(
      addItemsToCollection(COLLECTION_ID, UID, "Favorites", ["item-1"]),
    ).resolves.toBeUndefined();

    expect(mocks.from).toHaveBeenCalledTimes(5);
  });
});

describe("deleteCollection", () => {
  it("deletes bucket outfits but keeps slotted outfit links cleaned up safely", async () => {
    mocks.from
      .mockReturnValueOnce(
        chain({
          data: [{ outfit_id: "saved-1" }, { outfit_id: "bucket-1" }],
          error: null,
        }),
      )
      .mockReturnValueOnce(
        chain({
          data: [{ outfit_id: "saved-1", slot: "top" }],
          error: null,
        }),
      )
      .mockReturnValueOnce(chain({ error: null }))
      .mockReturnValueOnce(chain({ error: null }))
      .mockReturnValueOnce(chain({ error: null }))
      .mockReturnValueOnce(chain({ error: null }));

    await expect(deleteCollection(COLLECTION_ID)).resolves.toBeUndefined();

    expect(mocks.from).toHaveBeenCalledTimes(6);
  });

  it("throws when slot lookup fails", async () => {
    mocks.from
      .mockReturnValueOnce(
        chain({ data: [{ outfit_id: "outfit-1" }], error: null }),
      )
      .mockReturnValueOnce(
        chain({ data: null, error: { message: "slot lookup failed" } }),
      );

    await expect(deleteCollection(COLLECTION_ID)).rejects.toThrow(
      "slot lookup failed",
    );
  });
});
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection:
// Bucket outfits have no slots, so they count toward item_count but not outfit_count.
// Multi-step flows use mockReturnValueOnce in call order; verified against collections.ts.
