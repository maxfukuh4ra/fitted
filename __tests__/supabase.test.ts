import { describe, expect, it, vi } from "vitest";

import * as supabaseJs from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

vi.mock("@supabase/supabase-js", () => {
  const mockClient = {
    auth: {
      signInWithPassword: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(),
        then: vi.fn((callback) => {
          callback({ data: [], error: null });
          return Promise.resolve({ data: [], error: null });
        }),
      })),
    })),
  };

  return {
    createClient: vi.fn(() => mockClient),
  };
});

describe("lib/supabase", () => {
  it("calls createClient with env vars and exports the client", () => {
    expect(supabaseJs.createClient).toHaveBeenCalledWith(
      process.env.EXPO_PUBLIC_SUPABASE_URL,
      process.env.EXPO_PUBLIC_SUPABASE_KEY,
    );

    expect(supabase.auth).toBeDefined();
  });

  it("fetches items from the items table", () => {
    const mockItems = [
      { id: 1, name: "Item 1", user_id: "user-123" },
      { id: 2, name: "Item 2", user_id: "user-123" },
    ];

    // required for Typescript linting
    const mockThen = vi.fn((callback) => {
      callback({ data: mockItems, error: null });
    });

    const mockEq = vi.fn(() => ({
      then: mockThen,
    }));

    const mockSelect = vi.fn(() => ({
      eq: mockEq,
      then: mockThen,
    }));

    const mockFrom = vi.fn(() => ({
      select: mockSelect,
    }));

    (supabase.from as any) = mockFrom;

    // Test basic fetch
    supabase
      .from("items")
      .select("*")
      .then(({ data, error }: any) => {
        expect(data).toEqual(mockItems);
        expect(error).toBeNull();
      });

    expect(mockFrom).toHaveBeenCalledWith("items");
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockThen).toHaveBeenCalled();
  });
});
