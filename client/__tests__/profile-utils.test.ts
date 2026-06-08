// [GenAI Use] Prompt: import necessary libraries and components for unit testing profile utility functions like height formatting and string capitalization.
// [GenAI Use] Reflection: i reviewed the utility functions being tested and understood how edge cases like null inputs and zero values are handled
import { describe, expect, it } from "vitest";
import {
  capitalize,
  getInitials,
  inchesToFeetAndInches,
} from "../components/profile/profile-utils";

// [GenAI Use] Prompt:
// "Write unit tests for the profile helper functions in profile-utils.ts."
// [GenAI Use] LLM Response Start
describe("inchesToFeetAndInches", () => {
  it("converts whole feet", () => {
    expect(inchesToFeetAndInches(60)).toBe("5'0\"");
  });

  it("converts feet and inches", () => {
    expect(inchesToFeetAndInches(70)).toBe("5'10\"");
  });

  it("returns em dash for null", () => {
    expect(inchesToFeetAndInches(null)).toBe("—");
  });

  it("returns em dash for undefined", () => {
    expect(inchesToFeetAndInches(undefined)).toBe("—");
  });
});

describe("capitalize", () => {
  it("capitalizes first letter", () => {
    expect(capitalize("male")).toBe("Male");
  });

  it("returns em dash for empty string", () => {
    expect(capitalize("")).toBe("—");
  });

  it("returns em dash for null", () => {
    expect(capitalize(null)).toBe("—");
  });
});

describe("getInitials", () => {
  it("returns initials for two-word name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("returns single initial for one-word name", () => {
    expect(getInitials("John")).toBe("J");
  });

  it("returns at most two initials for long names", () => {
    expect(getInitials("John Michael Doe")).toBe("JM");
  });

  it("returns ? for null", () => {
    expect(getInitials(null)).toBe("?");
  });

  it("returns ? for empty string", () => {
    expect(getInitials("")).toBe("?");
  });

  it("returns ? for whitespace-only string", () => {
    expect(getInitials("   ")).toBe("?");
  });
});
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection:
// I ran the tests and checked each output by hand. I added a couple edge cases the
// first draft missed, e.g. "returns ? for whitespace-only string" for getInitials.
