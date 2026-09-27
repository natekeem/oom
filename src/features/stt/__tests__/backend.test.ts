import { webcrypto } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { createSttHandler } from "../../../../supabase/functions/stt-api/handler";
import {
  geminiSttProvider,
  normalizeGeminiMime,
  SttProviderError,
  type SttProvider,
} from "../../../../supabase/functions/stt-api/provider";
import type { SupabaseClient } from "@supabase/supabase-js";

Object.defineProperty(globalThis.crypto, "subtle", {
  value: webcrypto.subtle,
  configurable: true,
});

if (!Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = async function () {
    return new TextEncoder().encode("audio-data-bytes-content").buffer;
  };
}
if (!Blob.prototype.text) {
  Blob.prototype.text = async function () {
    return "audio-data-bytes-content";
  };
}
if (typeof File !== "undefined") {
  if (!File.prototype.arrayBuffer) {
    File.prototype.arrayBuffer = async function () {
      return new TextEncoder().encode("audio-data-bytes-content").buffer;
    };
  }
  if (!File.prototype.text) {
    File.prototype.text = async function () {
      return "audio-data-bytes-content";
    };
  }
}

const defaultQuota = {
  plan: "free",
  limitMs: 600000,
  usedMs: 30000,
  reservedMs: 0,
  remainingMs: 570000,
  resetsAt: "2026-09-27T00:00:00+09:00",
  enabled: true,
};

function createMockDeps(code = "RESERVED") {
  const rpc = vi.fn(async (name: string, args: Record<string, unknown>) => {
    if (name === "stt_quota") {
      return { data: defaultQuota, error: null };
    }
    if (name === "reserve_stt_usage") {
      if (code === "RECOVERED") {
        return {
          data: {
            code: "RECOVERED",
            transcript: "Cached recovered answer um yes.",
            language: "en-US",
            durationMs: args.p_duration_ms,
            quota: defaultQuota,
          },
          error: null,
        };
      }
      return {
        data: {
          code,
          model: "gemini-3.5-transcribe",
          quota: defaultQuota,
          terminal: code === "DAILY_STT_QUOTA_EXCEEDED" || code === "STT_DISABLED",
        },
        error: null,
      };
    }
    if (name === "finalize_stt_usage") {
      return {
        data: {
          code: args.p_error ? "failed" : "succeeded",
          transcript: args.p_transcript,
          durationMs: args.p_duration_ms,
          quota: defaultQuota,
        },
        error: null,
      };
    }
    return { data: null, error: null };
  });

  const authenticate = vi.fn(async (req: Request) => {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer valid-token")) {
      return null;
    }
    return {
      userId: "test-user-uuid",
      db: { rpc, from: vi.fn() } as unknown as SupabaseClient,
    };
  });

  const provider: SttProvider = {
    transcribe: vi.fn(async () => ({
      transcript: "I went to the park um yesterday.",
      language: "en-US",
      inputTokens: 100,
      outputTokens: 20,
    })),
  };

  return { authenticate, provider, rpc };
}

function buildFormRequest(
  data: {
    audio?: Blob;
    mimeType?: string;
    durationMs?: number;
    source?: string;
    requestId?: string;
  },
  token = "valid-token"
) {
  const form = new FormData();
  if (data.audio !== undefined) {
    form.append("audio", data.audio, "test.webm");
  }
  const mime = data.mimeType !== undefined ? data.mimeType : "audio/webm";
  if (mime) {
    form.append("mimeType", mime);
  }
  if (data.durationMs !== undefined) {
    form.append("durationMs", String(data.durationMs));
  }
  if (data.source !== undefined) {
    form.append("source", data.source);
  }
  if (data.requestId !== undefined) {
    form.append("requestId", data.requestId);
  }

  const req = new Request("https://example.test/functions/v1/stt-api/transcribe", {
    method: "POST",
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  });
  req.formData = async () => form;
  return req;
}

describe("stt-api Edge Function Handler", () => {
  const dummyAudio = new Blob(["audio-data-bytes-content"], { type: "audio/webm" });
  dummyAudio.arrayBuffer = async () => new TextEncoder().encode("audio-data-bytes-content").buffer;

  it("handles CORS OPTIONS preflight", async () => {
    const deps = createMockDeps();
    const handler = createSttHandler(deps);
    const req = new Request("https://example.test/functions/v1/stt-api/transcribe", {
      method: "OPTIONS",
      headers: {
        origin: "https://opic-on-me.com",
      },
    });

    const res = await handler(req);
    expect(res.status).toBe(204);
  });

  it("handles CORS OPTIONS preflight requesting authorization, content-type, x-request-id", async () => {
    const deps = createMockDeps();
    const handler = createSttHandler(deps);
    const req = new Request("https://example.test/functions/v1/stt-api/transcribe", {
      method: "OPTIONS",
      headers: {
        origin: "https://opic-on-me.com",
        "access-control-request-method": "POST",
        "access-control-request-headers": "authorization, content-type, x-request-id",
      },
    });

    const res = await handler(req);
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe("https://opic-on-me.com");
    const allowedHeaders = (res.headers.get("access-control-allow-headers") ?? "")
      .toLowerCase()
      .split(",")
      .map((h) => h.trim());
    expect(allowedHeaders).toContain("authorization");
    expect(allowedHeaders).toContain("content-type");
    expect(allowedHeaders).toContain("x-request-id");
  });

  it("requires bearer authentication (LOGIN_REQUIRED)", async () => {
    const deps = createMockDeps();
    const handler = createSttHandler(deps);
    const req = buildFormRequest({ audio: dummyAudio, durationMs: 5000 }, "");

    const res = await handler(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe("LOGIN_REQUIRED");
  });

  it("serves GET /quota for authenticated users", async () => {
    const deps = createMockDeps();
    const handler = createSttHandler(deps);
    const req = new Request("https://example.test/functions/v1/stt-api/quota", {
      method: "GET",
      headers: { authorization: "Bearer valid-token" },
    });

    const res = await handler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.remainingMs).toBe(570000);
    expect(deps.rpc).toHaveBeenCalledWith("stt_quota", { p_user: "test-user-uuid" });
  });

  it("validates audio input presence and size constraints", async () => {
    const deps = createMockDeps();
    const handler = createSttHandler(deps);

    // Missing audio
    const resNoAudio = await handler(buildFormRequest({ durationMs: 5000 }));
    expect(resNoAudio.status).toBe(415);
    const bodyNoAudio = await resNoAudio.json();
    expect(bodyNoAudio.error.code).toBe("UNSUPPORTED_AUDIO_FORMAT");

    // Invalid MIME type
    const resBadMime = await handler(
      buildFormRequest({
        audio: new Blob(["not audio"], { type: "image/png" }),
        mimeType: "image/png",
        durationMs: 5000,
      })
    );
    expect(resBadMime.status).toBe(415);

    // Duration too short (<500ms)
    const resShort = await handler(
      buildFormRequest({ audio: dummyAudio, durationMs: 200 })
    );
    expect(resShort.status).toBe(415);

    // Duration too long (>180s for quick_practice)
    const resLong = await handler(
      buildFormRequest({ audio: dummyAudio, durationMs: 200000, source: "quick_practice" })
    );
    expect(resLong.status).toBe(400);
    const bodyLong = await resLong.json();
    expect(bodyLong.error.code).toBe("AUDIO_TOO_LONG");
  });

  it("returns cached transcript on idempotency recovery without calling provider", async () => {
    const deps = createMockDeps("RECOVERED");
    const handler = createSttHandler(deps);
    const req = buildFormRequest({
      audio: dummyAudio,
      mimeType: "audio/webm",
      durationMs: 15000,
      requestId: "11111111-1111-4111-a111-111111111111",
    });

    const res = await handler(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.transcript).toBe("Cached recovered answer um yes.");
    expect(deps.provider.transcribe).not.toHaveBeenCalled();
  });

  it("blocks requests when daily STT quota is exceeded", async () => {
    const deps = createMockDeps("DAILY_STT_QUOTA_EXCEEDED");
    const handler = createSttHandler(deps);
    const req = buildFormRequest({
      audio: dummyAudio,
      durationMs: 10000,
    });

    const res = await handler(req);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error.code).toBe("DAILY_STT_QUOTA_EXCEEDED");
    expect(deps.provider.transcribe).not.toHaveBeenCalled();
  });

  it("blocks requests when STT kill switch is active", async () => {
    const deps = createMockDeps("STT_DISABLED");
    const handler = createSttHandler(deps);
    const req = buildFormRequest({
      audio: dummyAudio,
      durationMs: 10000,
    });

    const res = await handler(req);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error.code).toBe("STT_DISABLED");
    expect(deps.provider.transcribe).not.toHaveBeenCalled();
  });

  it("completes full transcription workflow: reserve -> provider -> finalize", async () => {
    const deps = createMockDeps("RESERVED");
    const handler = createSttHandler(deps);
    const req = buildFormRequest({
      audio: dummyAudio,
      mimeType: "audio/webm",
      durationMs: 8000,
      requestId: "22222222-2222-4222-a222-222222222222",
    });

    const res = await handler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.schemaVersion).toBe(1);
    expect(body.transcript).toBe("I went to the park um yesterday.");
    expect(body.language).toBe("en-US");
    expect(body.durationMs).toBe(8000);

    expect(deps.rpc).toHaveBeenCalledWith("reserve_stt_usage", expect.objectContaining({
      p_user: "test-user-uuid",
      p_duration_ms: 8000,
    }));

    expect(deps.provider.transcribe).toHaveBeenCalledTimes(1);

    expect(deps.rpc).toHaveBeenCalledWith("finalize_stt_usage", expect.objectContaining({
      p_user: "test-user-uuid",
      p_transcript: "I went to the park um yesterday.",
      p_duration_ms: 8000,
    }));
  });

  it("handles provider failure and refunds quota", async () => {
    const deps = createMockDeps("RESERVED");
    deps.provider.transcribe = vi.fn().mockRejectedValueOnce(
      new SttProviderError("PROVIDER_UNAVAILABLE", "Gemini 503")
    );
    const handler = createSttHandler(deps);
    const req = buildFormRequest({
      audio: dummyAudio,
      mimeType: "audio/webm",
      durationMs: 10000,
    });

    const res = await handler(req);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error.code).toBe("PROVIDER_UNAVAILABLE");
    expect(body.quotaConsumed).toBe(false);

    expect(deps.rpc).toHaveBeenCalledWith("finalize_stt_usage", expect.objectContaining({
      p_user: "test-user-uuid",
      p_error: "PROVIDER_UNAVAILABLE",
    }));
  });

  describe("MIME Normalization & Whitelist for Gemini STT", () => {
    it("normalizes audio/webm;codecs=opus to canonical audio/webm", () => {
      expect(normalizeGeminiMime("audio/webm;codecs=opus")).toBe("audio/webm");
    });

    it("normalizes audio/ogg;codecs=opus to canonical audio/ogg", () => {
      expect(normalizeGeminiMime("audio/ogg;codecs=opus")).toBe("audio/ogg");
    });

    it("accepts canonical audio/webm directly", () => {
      expect(normalizeGeminiMime("audio/webm")).toBe("audio/webm");
    });

    it("normalizes audio/x-wav and audio/wave to canonical audio/wav", () => {
      expect(normalizeGeminiMime("audio/x-wav")).toBe("audio/wav");
      expect(normalizeGeminiMime("audio/wave")).toBe("audio/wav");
    });

    it("normalizes video/webm to audio/webm for audio-only recorder", () => {
      expect(normalizeGeminiMime("video/webm")).toBe("audio/webm");
    });

    it("normalizes audio/x-m4a and audio/mp4 to audio/m4a", () => {
      expect(normalizeGeminiMime("audio/x-m4a")).toBe("audio/m4a");
      expect(normalizeGeminiMime("audio/mp4")).toBe("audio/m4a");
    });

    it("rejects unsupported audio/foo as null", () => {
      expect(normalizeGeminiMime("audio/foo")).toBeNull();
      expect(normalizeGeminiMime("audio/foo;codecs=bar")).toBeNull();
    });
  });

  describe("STT Handler MIME Normalization & Rejection Regression", () => {
    it("normalizes audio/webm;codecs=opus and passes canonical MIME to provider", async () => {
      const deps = createMockDeps("RESERVED");
      const handler = createSttHandler(deps);
      const req = buildFormRequest({
        audio: dummyAudio,
        mimeType: "audio/webm;codecs=opus",
        durationMs: 5000,
      });

      const res = await handler(req);
      expect(res.status).toBe(200);
      expect(deps.provider.transcribe).toHaveBeenCalledWith(
        expect.any(Uint8Array),
        "audio/webm",
        "gemini-3.5-transcribe",
        expect.anything()
      );
    });

    it("normalizes audio/ogg;codecs=opus and passes canonical MIME to provider", async () => {
      const deps = createMockDeps("RESERVED");
      const handler = createSttHandler(deps);
      const req = buildFormRequest({
        audio: dummyAudio,
        mimeType: "audio/ogg;codecs=opus",
        durationMs: 5000,
      });

      const res = await handler(req);
      expect(res.status).toBe(200);
      expect(deps.provider.transcribe).toHaveBeenCalledWith(
        expect.any(Uint8Array),
        "audio/ogg",
        "gemini-3.5-transcribe",
        expect.anything()
      );
    });

    it("accepts audio/webm and passes canonical MIME to provider", async () => {
      const deps = createMockDeps("RESERVED");
      const handler = createSttHandler(deps);
      const req = buildFormRequest({
        audio: dummyAudio,
        mimeType: "audio/webm",
        durationMs: 5000,
      });

      const res = await handler(req);
      expect(res.status).toBe(200);
      expect(deps.provider.transcribe).toHaveBeenCalledWith(
        expect.any(Uint8Array),
        "audio/webm",
        "gemini-3.5-transcribe",
        expect.anything()
      );
    });

    it("normalizes audio/x-wav and passes canonical audio/wav to provider", async () => {
      const deps = createMockDeps("RESERVED");
      const handler = createSttHandler(deps);
      const req = buildFormRequest({
        audio: dummyAudio,
        mimeType: "audio/x-wav",
        durationMs: 5000,
      });

      const res = await handler(req);
      expect(res.status).toBe(200);
      expect(deps.provider.transcribe).toHaveBeenCalledWith(
        expect.any(Uint8Array),
        "audio/wav",
        "gemini-3.5-transcribe",
        expect.anything()
      );
    });

    it("rejects unsupported audio/foo before provider call", async () => {
      const deps = createMockDeps("RESERVED");
      const handler = createSttHandler(deps);
      const req = buildFormRequest({
        audio: dummyAudio,
        mimeType: "audio/foo",
        durationMs: 5000,
      });

      const res = await handler(req);
      expect(res.status).toBe(415);
      const body = await res.json();
      expect(body.error.code).toBe("UNSUPPORTED_AUDIO_FORMAT");
      expect(deps.rpc).not.toHaveBeenCalledWith("reserve_stt_usage", expect.anything());
      expect(deps.provider.transcribe).not.toHaveBeenCalled();
    });
  });

  describe("geminiSttProvider canonical payload & language_codes", () => {
    it("passes canonical MIME and language_codes: ['en-US'] to Gemini APIs", async () => {
      const originalFetch = globalThis.fetch;
      const fetchMock = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
        const urlStr = String(url);
        if (urlStr.includes("/files?key=")) {
          return new Response(
            JSON.stringify({ file: { name: "files/test-file", uri: "https://example.com/file" } }),
            { status: 200 }
          );
        }
        if (urlStr.includes("/interactions?key=")) {
          const body = JSON.parse(init?.body as string);
          expect(body.input[0].mime_type).toBe("audio/webm");
          expect(body.generation_config.transcription_config.language_codes).toEqual(["en-US"]);
          expect(body.generation_config.transcription_config.mode).toBe("verbatim");
          return new Response(
            JSON.stringify({
              candidates: [{ content: { parts: [{ text: "I went to the park yesterday." }] } }],
              usageMetadata: { promptTokenCount: 120, candidatesTokenCount: 25 },
            }),
            { status: 200 }
          );
        }
        return new Response(null, { status: 200 });
      });

      globalThis.fetch = fetchMock;
      try {
        const provider = geminiSttProvider("mock-gemini-key");
        const result = await provider.transcribe(
          new Uint8Array([1, 2, 3]),
          "audio/webm;codecs=opus",
          "gemini-3.5-transcribe"
        );

        expect(result.transcript).toBe("I went to the park yesterday.");
        expect(result.language).toBe("en-US");
        expect(result.inputTokens).toBe(120);
        expect(result.outputTokens).toBe(25);

        // Verify upload call headers had canonical MIME
        const uploadCall = fetchMock.mock.calls.find((c) => String(c[0]).includes("/files?key="));
        expect(uploadCall).toBeDefined();
        const uploadHeaders = uploadCall![1]?.headers as Record<string, string>;
        expect(uploadHeaders["X-Goog-Upload-Header-Content-Type"]).toBe("audio/webm");
        expect(uploadHeaders["Content-Type"]).toBe("audio/webm");
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });
});
