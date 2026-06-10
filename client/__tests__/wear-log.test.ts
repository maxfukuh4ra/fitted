// [GenAI Use] Prompt:
// "Write unit tests for formatWornOn in lib/wear-log.ts. Month arg is 0-indexed."
// [GenAI Use] LLM Response Start
import { describe, expect, it, vi } from "vitest";

vi.mock("../lib/supabase", () => ({
  supabase: { auth: { getSession: vi.fn() }, from: vi.fn() },
}));

import { formatWornOn } from "../lib/wear-log";

describe("formatWornOn", () => {
  it("formats a date with zero-padded month and day", () => {
    expect(formatWornOn(2026, 5, 9)).toBe("2026-06-09");
  });

  it("zero-pads single-digit month and day", () => {
    expect(formatWornOn(2026, 0, 5)).toBe("2026-01-05");
  });

  it("handles end-of-month dates", () => {
    expect(formatWornOn(2026, 1, 28)).toBe("2026-02-28");
  });
});
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection:
// Confirmed month is 0-indexed in the source (month + 1 in the formatter).
// Mocked supabase so importing wear-log.ts does not require env vars.
