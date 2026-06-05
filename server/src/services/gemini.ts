import "dotenv/config";

// [GenAI Use] Prompt: "Write an effective prompt to ensure consistent results.
// At a high level, I want to take any image with a clothing item in it, and output
// that clothing item flattened against a white background, as one might see it in
// a shopping listing."
// [GenAI Use] LLM Response Start
const CLOTHING_ITEM_STANDARDIZATION_PROMPT = `Transform the provided image into a clean e-commerce style apparel product photo.

Your task is to isolate the primary clothing item and generate a standardized flat-lay product image suitable for a modern online clothing store.

Requirements:

Detect the main clothing item in the image.
Remove the original background completely.
Output ONLY the clothing item.
Place the clothing item centered on a pure white background.
Flatten and straighten the clothing item naturally, as if professionally prepared for a retail catalog.
Preserve the exact clothing shape, colors, patterns, logos, textures, stitching, and proportions.
Remove wrinkles, folds, perspective distortion, mannequins, hangers, people, hands, shadows, and surrounding objects.
Ensure the clothing item is fully visible and uncropped.
Standardize orientation:
Tops should face upright.
Pants should be vertically aligned.
The shoes must be standing upright and oriented so that the front is directly toward the camera. Do NOT angle the shoes.
Use soft, even studio lighting.
Generate a clean, minimal, premium shopping-listing appearance.
Keep image photorealistic.
Do NOT stylize, redesign, or invent new details.
Do NOT add props, decorations, models, or text.
Maintain accurate aspect ratio and realistic fabric texture.

If multiple clothing items are present:

Focus only on the most prominent item.
Ignore background apparel and accessories unless they are clearly part of the main garment.`;

// [GenAI Use] Reflection: The prompt generated was mostly effective. I did find it too verbose and redundant so I went through and removed
// unnecessary details.

export async function standardizeImage(base64: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing Gemini API key: set GEMINI_API_KEY in the server environment.",
    );
  }

  const { mimeType, data } = parseBase64ImageInput(base64);

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent";

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          { text: CLOTHING_ITEM_STANDARDIZATION_PROMPT },
          {
            inlineData: {
              mimeType,
              data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K",
      },
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(requestBody),
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(
      `Gemini API error (${response.status} ${response.statusText}): ${truncateForError(
        responseText,
      )}`,
    );
  }

  let responseJson: unknown;
  try {
    responseJson = responseText ? JSON.parse(responseText) : null;
  } catch {
    throw new Error(
      `Gemini API returned non-JSON response: ${truncateForError(responseText)}`,
    );
  }

  const imageBase64 = extractFirstInlineImageBase64(responseJson);
  if (imageBase64) return imageBase64;

  const debugContext = summarizeNoImageDebugContext(responseJson);
  // TODO: upon testing, this error will be thrown if an image is uploaded that does not contain clothing at all. This should be handled gracefully
  throw new Error(
    `Generation failed: No image returned in the response parts. Perhaps the image did not contain a piece of clothing? ${debugContext ? ` ${debugContext}` : ""}`,
  );
}

type ParsedBase64Input = { mimeType: string; data: string };

function parseBase64ImageInput(input: string): ParsedBase64Input {
  const trimmed = input.trim();

  // Supports: data:image/png;base64,AAA...
  // Also tolerates: data:image/jpeg;base64\n,AAA... (some encoders insert whitespace)
  const dataUrlMatch = /^data:([^;]+);base64,([\s\S]+)$/i.exec(trimmed);
  if (dataUrlMatch) {
    const mimeType = dataUrlMatch[1].trim().toLowerCase();
    const data = dataUrlMatch[2].trim().replace(/\s+/g, "");
    return { mimeType: mimeType || "image/jpeg", data };
  }

  // Assume raw base64 bytes with an implied image type.
  return { mimeType: "image/jpeg", data: trimmed.replace(/\s+/g, "") };
}

function truncateForError(text: string, maxLength: number = 500): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength)}…`;
}

function extractFirstInlineImageBase64(responseJson: unknown): string | null {
  if (!responseJson || typeof responseJson !== "object") return null;

  const candidates = (responseJson as any).candidates;
  if (!Array.isArray(candidates)) return null;

  for (const candidate of candidates) {
    const parts = candidate?.content?.parts;
    if (!Array.isArray(parts)) continue;

    for (const part of parts) {
      // The API can return internal "thought" parts; ignore them.
      if (part?.thought === true) continue;

      const inlineData = part?.inlineData;
      const data = inlineData?.data;
      if (typeof data === "string" && data.length > 0) {
        return data;
      }
    }
  }

  return null;
}

function summarizeNoImageDebugContext(responseJson: unknown): string {
  if (!responseJson || typeof responseJson !== "object") return "";

  const promptFeedback = (responseJson as any).promptFeedback;
  const candidates = (responseJson as any).candidates;

  const finishReasons: string[] = [];
  if (Array.isArray(candidates)) {
    for (const candidate of candidates) {
      const reason = candidate?.finishReason;
      if (typeof reason === "string" && reason) finishReasons.push(reason);
    }
  }

  const bits: string[] = [];
  if (finishReasons.length > 0)
    bits.push(`finishReason=${finishReasons.join(",")}`);
  if (promptFeedback)
    bits.push(`promptFeedback=${safeOneLineJson(promptFeedback)}`);

  return bits.length > 0 ? `(${bits.join(" ")})` : "";
}

function safeOneLineJson(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
