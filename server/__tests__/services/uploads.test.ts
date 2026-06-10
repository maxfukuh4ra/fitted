// [GenAI Use] Prompt: "Write Vitest tests for an Express router with three routes: POST /prepare-image,
// POST /confirm-image, and POST /upload-image. The router uses Supabase for auth and DB inserts,
// multer for file uploads, and calls standardizeImage and uploadToStorage services.
// Mock all external dependencies using vi.mock. Cover auth failures, input validation,
// happy paths, service failures, and the separation of concerns between the two upload routes."
// [GenAI Use] Reflection: I thought thought test cases to add and used AI for code generation
// and setting the framework/tools to test. I removed redundant test cases and resolved
// minor testing bugs

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import express from "express";

const { mockGetUser, mockInsert, mockSupabaseInstance } = vi.hoisted(() => {
  const mockGetUser = vi.fn();
  const mockInsert = vi.fn();
  const mockSupabaseInstance = {
    auth: { getUser: mockGetUser },
    from: vi.fn(() => ({ insert: mockInsert })),
    storage: { from: vi.fn() },
  };
  return { mockGetUser, mockInsert, mockSupabaseInstance };
});

// ─── Mock external dependencies ──────────────────────────────────────────────

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => mockSupabaseInstance),
}));

vi.mock("../../src/services/gemini", () => ({
  standardizeImage: vi.fn(),
}));

vi.mock("../../src/services/removebg", () => ({
  removeBackground: vi.fn(),
}));

vi.mock("../../src/services/storage", () => ({
  uploadToStorage: vi.fn(),
}));

// ─── Import AFTER mocks ───────────────────────────────────────────────────────

import { standardizeImage } from "../../src/services/gemini";
import { uploadToStorage } from "../../src/services/storage";
import imageRouter from "../../src/routes/upload";

// ─── Typed mock references ────────────────────────────────────────────────────

const mockStandardizeImage = vi.mocked(standardizeImage);
const mockUploadToStorage = vi.mocked(uploadToStorage);

// ─── App factory + auth helpers ──────────────────────────────────────────────

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api", imageRouter);
  return app;
}

function mockAuthSuccess(userId = "user-123") {
  mockGetUser.mockResolvedValue({ data: { user: { id: userId } } });
}

function mockAuthFailure() {
  mockGetUser.mockResolvedValue({ data: { user: null } });
}

// ─── Shared setup ─────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  // Re-wire from() after clearAllMocks resets it
  mockSupabaseInstance.from.mockReturnValue({ insert: mockInsert });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/prepare-image
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/prepare-image", () => {
  const app = buildApp();

  // TC-01: No token
  it("TC-01 | returns 401 when no Authorization header is provided", async () => {
    const res = await request(app)
      .post("/api/prepare-image")
      .attach("image", Buffer.from("fake-image"), {
        filename: "shirt.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("no token");
  });

  // TC-02: Invalid token → Supabase returns null user
  it("TC-02 | returns 401 when token is invalid or expired", async () => {
    mockAuthFailure();

    const res = await request(app)
      .post("/api/prepare-image")
      .set("Authorization", "Bearer bad-token")
      .attach("image", Buffer.from("fake-image"), {
        filename: "shirt.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("unauthorized");
  });

  // TC-03: Wrong file type — multer fileFilter rejects before route logic
  it("TC-03 | returns 400 when file type is not JPEG, PNG, or WebP", async () => {
    mockAuthSuccess();

    const res = await request(app)
      .post("/api/prepare-image")
      .set("Authorization", "Bearer valid-token")
      .attach("image", Buffer.from("%PDF-1.4 fake"), {
        filename: "document.pdf",
        contentType: "application/pdf",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Only JPEG, PNG, and WebP/i);
  });

  // TC-04: Happy path — valid token + image, all services succeed
  it("TC-04 | returns 200 with imageUrl on successful processing", async () => {
    mockAuthSuccess();
    mockStandardizeImage.mockResolvedValue("standardized-base64-string");
    mockUploadToStorage.mockResolvedValue(
      "https://storage.example.com/user-123/12345.png"
    );

    const res = await request(app)
      .post("/api/prepare-image")
      .set("Authorization", "Bearer valid-token")
      .attach("image", Buffer.from("fake-jpeg-data"), {
        filename: "shirt.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.imageUrl).toBe(
      "https://storage.example.com/user-123/12345.png"
    );
  });

  // TC-05: Gemini throws — should surface as 500
  it("TC-05 | returns 500 when Gemini standardizeImage service throws", async () => {
    mockAuthSuccess();
    mockStandardizeImage.mockRejectedValue(new Error("Gemini API unavailable"));

    const res = await request(app)
      .post("/api/prepare-image")
      .set("Authorization", "Bearer valid-token")
      .attach("image", Buffer.from("fake-jpeg-data"), {
        filename: "shirt.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(500);
  });

  // TC-06: prepare-image does NOT write to DB (two-step flow invariant)
  it("TC-06 | prepare-image does not insert into the items table", async () => {
    mockAuthSuccess();
    mockStandardizeImage.mockResolvedValue("standardized-base64-string");
    mockUploadToStorage.mockResolvedValue("https://storage.example.com/img.png");

    await request(app)
      .post("/api/prepare-image")
      .set("Authorization", "Bearer valid-token")
      .attach("image", Buffer.from("fake-jpeg-data"), {
        filename: "shirt.jpg",
        contentType: "image/jpeg",
      });

    expect(mockInsert).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/confirm-image
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/confirm-image", () => {
  const app = buildApp();

  // TC-07: No token
  it("TC-07 | returns 401 when no Authorization header is provided", async () => {
    const res = await request(app)
      .post("/api/confirm-image")
      .send({ imageUrl: "https://example.com/img.png", category: "tops" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("no token");
  });

  // TC-08: Missing imageUrl
  it("TC-08 | returns 400 when imageUrl is missing from request body", async () => {
    mockAuthSuccess();

    const res = await request(app)
      .post("/api/confirm-image")
      .set("Authorization", "Bearer valid-token")
      .send({ category: "tops" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/imageUrl/i);
  });

  // TC-09: Missing category
  it("TC-09 | returns 400 when category is missing from request body", async () => {
    mockAuthSuccess();

    const res = await request(app)
      .post("/api/confirm-image")
      .set("Authorization", "Bearer valid-token")
      .send({ imageUrl: "https://example.com/img.png" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/category/i);
  });

  // TC-10: Happy path — required only; optional fields should insert as null
  it("TC-10 | returns 200 and inserts null for omitted optional fields", async () => {
    mockAuthSuccess("user-abc");
    mockInsert.mockResolvedValue({ error: null });

    const res = await request(app)
      .post("/api/confirm-image")
      .set("Authorization", "Bearer valid-token")
      .send({ imageUrl: "https://example.com/img.png", category: "tops" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ subcategory: null, item_name: null })
    );
  });

  // TC-11: Happy path — all fields including optional
  it("TC-11 | inserts all fields correctly when subcategory and name are provided", async () => {
    mockAuthSuccess("user-abc");
    mockInsert.mockResolvedValue({ error: null });

    await request(app)
      .post("/api/confirm-image")
      .set("Authorization", "Bearer valid-token")
      .send({
        imageUrl: "https://example.com/img.png",
        category: "tops",
        subcategory: "t-shirt",
        name: "Blue Nike Tee",
      });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-abc",
        image_url: "https://example.com/img.png",
        category: "tops",
        subcategory: "t-shirt",
        item_name: "Blue Nike Tee",
      })
    );
  });

  // TC-12: Supabase insert error
  it("TC-12 | returns 500 with error message when Supabase insert fails", async () => {
    mockAuthSuccess();
    mockInsert.mockResolvedValue({ error: { message: "duplicate key value" } });

    const res = await request(app)
      .post("/api/confirm-image")
      .set("Authorization", "Bearer valid-token")
      .send({ imageUrl: "https://example.com/img.png", category: "tops" });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("duplicate key value");
  });

  // TC-13: confirm-image does NOT process files (two-step flow invariant)
  it("TC-13 | confirm-image does not call any file processing services", async () => {
    mockAuthSuccess();
    mockInsert.mockResolvedValue({ error: null });

    await request(app)
      .post("/api/confirm-image")
      .set("Authorization", "Bearer valid-token")
      .send({ imageUrl: "https://example.com/img.png", category: "tops" });

    expect(mockUploadToStorage).not.toHaveBeenCalled();
    expect(mockStandardizeImage).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/upload-image
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/upload-image", () => {
  const app = buildApp();

  // TC-14: No token
  it("TC-14 | returns 401 when no Authorization header is provided", async () => {
    const res = await request(app)
      .post("/api/upload-image")
      .attach("image", Buffer.from("fake"), {
        filename: "test.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("no token");
  });

  // TC-15: Happy path — raw upload, skips AI entirely
  it("TC-15 | returns 200 with imageUrl and does not call standardizeImage", async () => {
    mockAuthSuccess();
    mockUploadToStorage.mockResolvedValue(
      "https://storage.example.com/user-123/raw.png"
    );

    const res = await request(app)
      .post("/api/upload-image")
      .set("Authorization", "Bearer valid-token")
      .attach("image", Buffer.from("fake-image-data"), {
        filename: "photo.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(200);
    expect(res.body.imageUrl).toBe(
      "https://storage.example.com/user-123/raw.png"
    );
    expect(mockStandardizeImage).not.toHaveBeenCalled();
  });
});