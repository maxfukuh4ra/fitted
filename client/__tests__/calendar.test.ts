// [GenAI Use] Prompt:
// "Write unit tests for loadCalendarMonth in lib/calendar.ts and loadDayWears in lib/wear-log.ts.
// Mock Supabase using the chain() pattern from friends.test.ts."
// [GenAI Use] LLM Response Start
import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadCalendarMonth } from "../lib/calendar";
import { loadDayWears } from "../lib/wear-log";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  from: vi.fn(),
}));

vi.mock("../lib/supabase", () => ({
  supabase: {
    auth: { getSession: mocks.getSession },
    from: mocks.from,
  },
}));

const UID = "user-123";

function chain(result: unknown) {
  const obj: any = {
    then(resolve: (v: unknown) => void, reject?: (e: unknown) => void) {
      return Promise.resolve(result).then(resolve, reject);
    },
  };
  for (const m of ["select", "eq", "gte", "lte", "in", "insert", "single"]) {
    obj[m] = () => obj;
  }
  return obj;
}

function mockMonthQueries(
  logData: unknown,
  statsData: unknown,
  logError: unknown = null,
  statsError: unknown = null,
) {
  mocks.from
    .mockReturnValueOnce(chain({ data: logData, error: logError }))
    .mockReturnValueOnce(chain({ data: statsData, error: statsError }));
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getSession.mockResolvedValue({
    data: { session: { user: { id: UID } } },
    error: null,
  });
});

describe("loadCalendarMonth", () => {
  it("throws when session lookup fails", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: null },
      error: { message: "session error" },
    });

    await expect(loadCalendarMonth(2026, 5)).rejects.toThrow("session error");
  });

  it("throws when there is no active session", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    await expect(loadCalendarMonth(2026, 5)).rejects.toThrow(
      "No active session.",
    );
  });

  it("throws when the wear_log day query fails", async () => {
    mocks.from.mockReturnValueOnce(
      chain({ data: null, error: { message: "logs failed" } }),
    );

    await expect(loadCalendarMonth(2026, 5)).rejects.toThrow("logs failed");
  });

  it("throws when the stats query fails", async () => {
    mockMonthQueries([], null, null, { message: "stats failed" });

    await expect(loadCalendarMonth(2026, 5)).rejects.toThrow("stats failed");
  });

  it("returns empty outfitDays and stats for an empty month", async () => {
    mockMonthQueries([], []);

    const result = await loadCalendarMonth(2026, 5);

    expect(result).toEqual({ outfitDays: [], stats: [] });
  });

  it("dedupes and sorts outfitDays", async () => {
    mockMonthQueries(
      [
        { worn_on: "2026-06-15" },
        { worn_on: "2026-06-03" },
        { worn_on: "2026-06-15" },
      ],
      [],
    );

    const result = await loadCalendarMonth(2026, 5);

    expect(result.outfitDays).toEqual([3, 15]);
  });

  it("returns top 3 worn items with zero-padded ranks", async () => {
    mockMonthQueries([], [
      {
        outfits: {
          outfit_items: [
            {
              items: {
                id: "a",
                item_name: "Jacket",
                image_url: "https://img/a.jpg",
              },
            },
            {
              items: {
                id: "b",
                item_name: "Jeans",
                image_url: null,
              },
            },
          ],
        },
      },
      {
        outfits: {
          outfit_items: [
            {
              items: {
                id: "a",
                item_name: "Jacket",
                image_url: "https://img/a.jpg",
              },
            },
          ],
        },
      },
      {
        outfits: {
          outfit_items: [
            {
              items: {
                id: "b",
                item_name: "Jeans",
                image_url: null,
              },
            },
          ],
        },
      },
      {
        outfits: {
          outfit_items: [
            {
              items: {
                id: "c",
                item_name: null,
                image_url: "https://img/c.jpg",
              },
            },
          ],
        },
      },
    ]);

    const result = await loadCalendarMonth(2026, 5);

    expect(result.stats).toHaveLength(3);
    expect(result.stats[0]).toMatchObject({
      rank: "01",
      name: "Jacket",
      wears: 2,
      imageUri: "https://img/a.jpg",
    });
    expect(result.stats[1]).toMatchObject({
      rank: "02",
      name: "Jeans",
      wears: 2,
    });
    expect(result.stats[2]).toMatchObject({
      rank: "03",
      name: "Untitled item",
      wears: 1,
      imageUri: "https://img/c.jpg",
    });
  });
});

describe("loadDayWears", () => {
  it("throws when there is no active session", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    await expect(loadDayWears(2026, 5, 9)).rejects.toThrow("No active session.");
  });

  it("returns an empty array when there are no logs", async () => {
    mocks.from.mockReturnValue(chain({ data: [], error: null }));

    expect(await loadDayWears(2026, 5, 9)).toEqual([]);
  });

  it("maps wear log entries and nested items", async () => {
    mocks.from.mockReturnValue(
      chain({
        data: [
          {
            id: "log-1",
            outfit_id: "outfit-1",
            worn_on: "2026-06-09",
            outfits: {
              outfit_items: [
                {
                  items: {
                    id: "item-1",
                    item_name: "Shirt",
                    image_url: "https://img/shirt.jpg",
                  },
                },
                { items: null },
              ],
            },
          },
        ],
        error: null,
      }),
    );

    const result = await loadDayWears(2026, 5, 9);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      wearLogId: "log-1",
      outfitId: "outfit-1",
      wornOn: "2026-06-09",
    });
    expect(result[0].items).toHaveLength(1);
    expect(result[0].items[0]).toMatchObject({
      id: "item-1",
      item_name: "Shirt",
      image_url: "https://img/shirt.jpg",
    });
  });

  it("throws when the wear_log query fails", async () => {
    mocks.from.mockReturnValue(
      chain({ data: null, error: { message: "day query failed" } }),
    );

    await expect(loadDayWears(2026, 5, 9)).rejects.toThrow("day query failed");
  });
});
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection:
// loadCalendarMonth hits wear_log twice, so mocks use mockReturnValueOnce in order.
// Confirmed stats ranking and "Untitled item" fallback against the source logic.
