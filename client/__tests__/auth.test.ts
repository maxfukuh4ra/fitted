import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser, signIn, signOut } from "../lib/auth";

// force hoist mock
const mocks = vi.hoisted(() => {
  return {
    signInWithPassword: vi.fn(),
    getUser: vi.fn(),
    signOut: vi.fn(),
  };
});

vi.mock("../lib/supabase", () => {
  return {
    supabase: {
      auth: {
        signInWithPassword: mocks.signInWithPassword,
        getUser: mocks.getUser,
        signOut: mocks.signOut,
      },
    },
  };
});

const mockUser = { id: "u1", email: "test@example.com" };

beforeEach(() => {
  mocks.signInWithPassword.mockReset();
  mocks.getUser.mockReset();
  mocks.signOut.mockReset();
});

describe("lib/auth", () => {
  it("signIn returns user on success", async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const user = await signIn("a@b.com", "pw");

    expect(user).toEqual(mockUser);
  });

  it("signIn throws on error", async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: "bad" },
    });

    await expect(signIn("a@b.com", "pw")).rejects.toThrow("bad");
  });

  it("getCurrentUser returns user", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const user = await getCurrentUser();

    expect(user).toEqual(mockUser);
  });

  it("getCurrentUser returns null", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const user = await getCurrentUser();

    expect(user).toBeNull();
  });

  it("getCurrentUser throws on error", async () => {
    mocks.getUser.mockResolvedValue({
      data: null,
      error: { message: "err" },
    });

    await expect(getCurrentUser()).rejects.toThrow("err");
  });

  it("signOut resolves without error on success", async () => {
    mocks.signOut.mockResolvedValue({ error: null });

    await expect(signOut()).resolves.toBeUndefined();
  });

  it("signOut throws on error", async () => {
    mocks.signOut.mockResolvedValue({ error: { message: "sign out failed" } });

    await expect(signOut()).rejects.toThrow("sign out failed");
  });
});
