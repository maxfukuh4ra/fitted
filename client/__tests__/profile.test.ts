// [GenAI Use] Prompt: import necessary libraries and components for unit testing profile fetch and update functions with mocked Supabase calls.
// [GenAI Use] Reflection: i looked at how vi.mock and vi.hoisted set up the supabase mock before imports resolve and understood the test isolation approach
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getProfile, updateProfile } from "../lib/profile";

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
