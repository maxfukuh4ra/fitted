import { beforeEach, describe, expect, it, vi } from "vitest";
import { getProfile, updateProfile } from "../lib/profile";

// [GenAI Use] Prompt:
// "Write unit tests for getProfile and updateProfile in lib/profile.ts using Vitest.
// Mock Supabase and cover success and error cases."
// [GenAI Use] LLM Response Start
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

const mockSession = {
  user: { id: "user-1", email: "test@example.com" },
};

const mockRow = { name: "Jane Doe", age: 25, height: 65, gender: "female" };

beforeEach(() => {
  mocks.getSession.mockReset();
  mocks.from.mockReset();
});

describe("getProfile", () => {
  it("returns a full UserProfile on success", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    mocks.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: mockRow, error: null }),
        }),
      }),
    });

    const profile = await getProfile();

    expect(profile).toEqual({
      id: "user-1",
      email: "test@example.com",
      ...mockRow,
    });
  });

  it("throws when there is no active session", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    await expect(getProfile()).rejects.toThrow("No active session.");
  });

  it("throws when getSession returns an error", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: null },
      error: { message: "session error" },
    });

    await expect(getProfile()).rejects.toThrow("session error");
  });

  it("throws when the users table query fails", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    mocks.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({ data: null, error: { message: "db error" } }),
        }),
      }),
    });

    await expect(getProfile()).rejects.toThrow("db error");
  });
});

describe("updateProfile", () => {
  it("resolves without error on success", async () => {
    mocks.from.mockReturnValue({
      update: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    });

    await expect(
      updateProfile("user-1", { name: "New Name" })
    ).resolves.toBeUndefined();
  });

  it("throws when the update fails", async () => {
    mocks.from.mockReturnValue({
      update: () => ({
        eq: () =>
          Promise.resolve({ error: { message: "update failed" } }),
      }),
    });

    await expect(
      updateProfile("user-1", { name: "New Name" })
    ).rejects.toThrow("update failed");
  });
});
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection:
// I ran each test locally and checked that the mocks matched how profile.ts calls Supabase.
// The first draft did not cover every failure path so I added cases when a test failed or
// left a gap, e.g. "throws when there is no active session" after getProfile did not handle
// a signed-out user the way I expected.
