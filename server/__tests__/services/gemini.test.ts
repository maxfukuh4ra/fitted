// [GenAI Use] Prompt: "I need to write gemini.test.ts for my FITTED project. The goal is to unit test the service without making real API calls, so use Vitest mocks/stubs/spies to isolate it from the external Gemini API. Cover missing API key handling, request payload correctness, successful inline image extraction, and failure cases like non-OK responses, non-JSON responses, and missing image data."
// [GenAI Use] Reflection: Most of the generated tests were mostly well written and passing. I made a few improvements by adding a missing network failure test case, improving readability in some assertions, and ensuring the test style remained consistent with the rest of the project's codebase and testing conventions.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { standardizeImage } from "../../src/services/gemini";

const originalFetch = globalThis.fetch;
const originalApiKey = process.env.GEMINI_API_KEY;

function makeJsonResponse(body: unknown, ok: boolean = true) {
  return {
    ok,
    status: ok ? 200 : 500,
    statusText: ok ? "OK" : "Internal Server Error",
    text: vi.fn().mockResolvedValue(JSON.stringify(body)),
  } as any;
}

describe("standardizeImage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.GEMINI_API_KEY = "test-gemini-key";
  });

  afterEach(() => {
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    }

    if (originalApiKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = originalApiKey;
    }
  });

  it("throws when the Gemini API key is missing", async () => {
    delete process.env.GEMINI_API_KEY;

    await expect(standardizeImage("abcd")).rejects.toThrow(
      "Missing Gemini API key: set GEMINI_API_KEY in the server environment.",
    );
  });

  it("sends the expected request for a data URL input", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      makeJsonResponse({
        candidates: [
          {
            content: {
              parts: [{ inlineData: { data: "standardized-image-base64" } }],
            },
          },
        ],
      }),
    );
    globalThis.fetch = fetchMock as typeof fetch;

    const result = await standardizeImage("data:image/png;base64,ABC123");

    expect(result).toBe("standardized-image-base64");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent",
    );
    expect(options.method).toBe("POST");
    expect(options.headers).toEqual({
      "content-type": "application/json",
      "x-goog-api-key": "test-gemini-key",
    });

    const body = JSON.parse(options.body);
    expect(body.contents).toHaveLength(1);
    const content = body.contents[0];

    expect(content.role).toBe("user");
    expect(content.parts).toHaveLength(2);
    expect(content.parts[0].text).toContain(
      "Transform the provided image into a clean e-commerce style apparel product photo.",
    );
    expect(content.parts[0].text).toContain(
      "Do NOT stylize, redesign, or invent new details.",
    );
    expect(content.parts[1]).toEqual({
      inlineData: {
        mimeType: "image/png",
        data: "ABC123",
      },
    });
    expect(body.generationConfig).toEqual({
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K",
      },
    });
  });

  it("defaults raw base64 input to image/jpeg", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      makeJsonResponse({
        candidates: [
          {
            content: {
              parts: [{ inlineData: { data: "jpeg-output" } }],
            },
          },
        ],
      }),
    );
    globalThis.fetch = fetchMock as typeof fetch;

    await standardizeImage("RAWBASE64DATA");

    const [, options] = fetchMock.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body.contents[0].parts[1]).toEqual({
      inlineData: {
        mimeType: "image/jpeg",
        data: "RAWBASE64DATA",
      },
    });
  });

  it("returns the first non-thought inline image", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      makeJsonResponse({
        candidates: [
          {
            content: {
              parts: [
                { thought: true, inlineData: { data: "ignore-this" } },
                { inlineData: { data: "first-real-image" } },
                { inlineData: { data: "second-real-image" } },
              ],
            },
          },
        ],
      }),
    );
    globalThis.fetch = fetchMock as typeof fetch;

    await expect(standardizeImage("abcd")).resolves.toBe("first-real-image");
  });

  it("throws a Gemini API error when the HTTP response is not ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: vi.fn().mockResolvedValue("backend exploded"),
    });
    globalThis.fetch = fetchMock as typeof fetch;

    await expect(standardizeImage("abcd")).rejects.toThrow(
      "Gemini API error (500 Internal Server Error): backend exploded",
    );
  });

  it("propagates fetch failures", async () => {
    globalThis.fetch = vi
      .fn()
      .mockRejectedValue(new Error("network error")) as typeof fetch;

    await expect(standardizeImage("abcd")).rejects.toThrow("network error");
  });

  it("throws when Gemini returns non-JSON text", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: vi.fn().mockResolvedValue("<html>not json</html>"),
    });
    globalThis.fetch = fetchMock as typeof fetch;

    await expect(standardizeImage("abcd")).rejects.toThrow(
      "Gemini API returned non-JSON response: <html>not json</html>",
    );
  });

  it("throws when no image is returned in the response parts", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      makeJsonResponse({
        candidates: [
          {
            finishReason: "STOP",
            content: {
              parts: [{ text: "I could not generate an image." }],
            },
          },
        ],
        promptFeedback: { blockReason: "NONE" },
      }),
    );
    globalThis.fetch = fetchMock as typeof fetch;

    await expect(standardizeImage("abcd")).rejects.toThrow(
      "Generation failed: No image returned in the response parts.",
    );
  });
});
