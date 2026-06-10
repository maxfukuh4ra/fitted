// [GenAI Use] Prompt: "I need to write removebg.test.ts for my FITTED project. The goal is to unit test the service without making real API calls, so use Vitest mocks/stubs/spies to isolate it from the remove.bg API. Cover missing API key handling, request payload correctness, successful PNG response conversion, and error handling for specific HTTP statuses and generic server failures."
// [GenAI Use] Reflection: Most of the generated tests were mostly well written and passing. I made a few improvements by adding a missing network failure test case, improving readability in some assertions, and ensuring the test style remained consistent with the rest of the project's codebase and testing conventions.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { removeBackground } from "../../src/services/removebg";

const originalFetch = globalThis.fetch;
const originalApiKey = process.env.REMOVE_BG_API_KEY;

function makeImageResponse(bytes: number[]) {
  const imageBuffer = Uint8Array.from(bytes);

  return {
    ok: true,
    status: 200,
    text: vi.fn(),
    arrayBuffer: vi.fn().mockResolvedValue(imageBuffer.buffer),
  } as any;
}

describe("removeBackground", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.REMOVE_BG_API_KEY = "test-removebg-key";
  });

  afterEach(() => {
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    }

    if (originalApiKey === undefined) {
      delete process.env.REMOVE_BG_API_KEY;
    } else {
      process.env.REMOVE_BG_API_KEY = originalApiKey;
    }
  });

  it("throws when the remove.bg API key is missing", async () => {
    delete process.env.REMOVE_BG_API_KEY;

    await expect(removeBackground("abcd")).rejects.toThrow(
      "Missing remove.bg API key: set REMOVE_BG_API_KEY in the environment.",
    );
  });

  it("strips the data URL prefix and sends the expected request payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeImageResponse([1, 2, 3]));
    globalThis.fetch = fetchMock as typeof fetch;

    const result = await removeBackground("data:image/jpeg;base64,ABC123");

    expect(result).toBe("data:image/png;base64,AQID");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.remove.bg/v1.0/removebg");
    expect(options.method).toBe("POST");
    expect(options.headers).toEqual({
      "Content-Type": "application/json",
      "X-Api-Key": "test-removebg-key",
      Accept: "image/png",
    });

    const body = JSON.parse(options.body);
    expect(body).toEqual({
      image_file_b64: "ABC123",
      size: "auto",
      format: "png",
      type: "product",
      crop: true,
    });
  });

  it("removes whitespace from raw base64 input before sending it", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeImageResponse([9, 8, 7]));
    globalThis.fetch = fetchMock as typeof fetch;

    await removeBackground("AB C\n12\t3");

    const [, options] = fetchMock.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body.image_file_b64).toBe("ABC123");
  });

  it.each([
    [402, "remove.bg: Insufficient credits."],
    [403, "remove.bg: Authentication failed."],
    [429, "remove.bg: Rate limit exceeded."],
  ])("maps status %i correctly", async (status, message) => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status,
      text: vi.fn().mockResolvedValue("error"),
    }) as typeof fetch;

    await expect(removeBackground("abcd")).rejects.toThrow(message);
  });

  it("propagates fetch failures", async () => {
    globalThis.fetch = vi
      .fn()
      .mockRejectedValue(new Error("network error")) as typeof fetch;

    await expect(removeBackground("abcd")).rejects.toThrow("network error");
  });

  it("throws a generic API error for other non-OK responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: vi.fn().mockResolvedValue("server error"),
    });
    globalThis.fetch = fetchMock as typeof fetch;

    await expect(removeBackground("abcd")).rejects.toThrow(
      "remove.bg API error (500): server error",
    );
  });
});
