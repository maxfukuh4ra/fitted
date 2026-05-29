import { describe, expect, it, vi } from "vitest";

import * as supabaseJs from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

vi.mock("@supabase/supabase-js", () => {
  const mockClient = {
    auth: {
      signInWithPassword: vi.fn(),
      getUser: vi.fn(),
    },
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
});
