import type { SupabaseClient } from "npm:@supabase/supabase-js@2.116.0";
import {
  STT_MAX_DURATIONS_MS,
  type SttErrorCode,
  type SttSource,
} from "../../../shared/stt/types.ts";
import { jsonResponse, withTiming } from "../admin-api/cors.ts";
import {
  normalizeGeminiMime,
  SttProviderError,
  type SttProvider,
} from "./provider.ts";

export interface SttDependencies {
  authenticate(req: Request): Promise<{ userId: string; db: SupabaseClient } | null>;
  provider: SttProvider;
}

const statusCodes: Record<SttErrorCode, number> = {
  LOGIN_REQUIRED: 401,
  STT_DISABLED: 503,
  CUSTOM_STT_INVALID: 400,
  CUSTOM_STT_FAILED: 502,
  LOCAL_STT_UNAVAILABLE: 400,
  LOCAL_LANGUAGE_PACK_REQUIRED: 400,
  AUDIO_TOO_LONG: 400,
  AUDIO_TOO_LARGE: 413,
  UNSUPPORTED_AUDIO_FORMAT: 415,
  DAILY_STT_QUOTA_EXCEEDED: 429,
  RATE_LIMITED: 429,
  REQUEST_IN_PROGRESS: 409,
  PROVIDER_TIMEOUT: 504,
  PROVIDER_UNAVAILABLE: 503,
  EMPTY_TRANSCRIPT: 502,
  SERVER_ERROR: 500,
  IDEMPOTENCY_CONFLICT: 409,
};

const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // 25 MB

export function createSttHandler(deps: SttDependencies) {
  return async (req: Request): Promise<Response> => {
    const start = performance.now();
    const reply = (data: unknown, status = 200) =>
      withTiming(jsonResponse(req, data, status), start);
    const fail = (code: SttErrorCode, message?: string, extra = {}) =>
      reply(
        {
          error: {
            code,
            message: message || "음성 변환 요청을 완료하지 못했습니다.",
          },
          ...extra,
        },
        statusCodes[code] || 500
      );

    const origin = req.headers.get("origin");
    if (
      origin &&
      !["https://opic-on-me.com", "http://localhost:5173", "http://localhost:4173"].includes(origin)
    ) {
      return reply({ error: { code: "FORBIDDEN" } }, 403);
    }

    if (req.method === "OPTIONS") {
      return withTiming(
        new Response(null, {
          status: 204,
          headers: jsonResponse(req, {}).headers,
        }),
        start
      );
    }

    try {
      const auth = await deps.authenticate(req);
      if (!auth) {
        return fail("LOGIN_REQUIRED", "로그인 후 관리형 STT를 이용할 수 있습니다.");
      }
      const { userId, db } = auth;

      const url = new URL(req.url);
      const path = url.pathname.replace(/^\/(?:functions\/v1\/)?stt-api/, "").replace(/\/$/, "");

      const rpc = async (name: string, args: Record<string, unknown>) => {
        const { data, error } = await db.rpc(name, args);
        if (error) {
          throw new Error("SERVER_ERROR");
        }
        return data;
      };

      if (req.method === "GET" && path === "/quota") {
        return reply(await rpc("stt_quota", { p_user: userId }));
      }

      if (req.method !== "POST" || path !== "/transcribe") {
        return reply({ error: { code: "NOT_FOUND" } }, 404);
      }

      // Parse multipart/form-data
      let formData: FormData;
      try {
        formData = await req.formData();
      } catch {
        return fail("UNSUPPORTED_AUDIO_FORMAT", "요청 데이터(multipart)를 처리할 수 없습니다.");
      }

      const audioFile = formData.get("audio");
      if (!audioFile || !(audioFile instanceof Blob) || audioFile.size === 0) {
        return fail("UNSUPPORTED_AUDIO_FORMAT", "전송된 오디오 파일이 비어 있습니다.");
      }

      if (audioFile.size > MAX_AUDIO_BYTES) {
        return fail("AUDIO_TOO_LARGE", "오디오 파일 크기는 최대 25MB까지 지원됩니다.");
      }

      const filename = audioFile instanceof File ? audioFile.name : undefined;
      const rawMime = (formData.get("mimeType") as string) || audioFile.type || "audio/webm";
      const canonicalMime = normalizeGeminiMime(rawMime, filename);
      if (!canonicalMime) {
        return fail("UNSUPPORTED_AUDIO_FORMAT", "지원하지 않는 오디오 형식입니다.");
      }

      const durationMs = parseInt((formData.get("durationMs") as string) || "0", 10);
      if (isNaN(durationMs) || durationMs < 500) {
        return fail("UNSUPPORTED_AUDIO_FORMAT", "발화 길이가 유효하지 않습니다 (최소 0.5초 필요).");
      }

      const rawSource = (formData.get("source") as string) || "quick_practice";
      const source: SttSource = ["quick_practice", "roleplay", "mock_review"].includes(rawSource)
        ? (rawSource as SttSource)
        : "quick_practice";

      const maxDurationAllowed = STT_MAX_DURATIONS_MS[source] || 180000;
      if (durationMs > maxDurationAllowed) {
        return fail("AUDIO_TOO_LONG", `녹음 시간이 최대 허용 시간(${Math.round(maxDurationAllowed / 1000)}초)을 초과했습니다.`);
      }

      const learningAttemptId = (formData.get("learningAttemptId") as string) || null;
      if (learningAttemptId) {
        const { data: attempt, error: attemptError } = await db
          .from("learning_attempts")
          .select("id")
          .eq("id", learningAttemptId)
          .eq("user_id", userId)
          .maybeSingle();

        if (attemptError) return fail("SERVER_ERROR");
        if (!attempt) return fail("SERVER_ERROR", "학습 시도 식별자가 올바르지 않습니다.");
      }

      const headerRequestId = req.headers.get("x-request-id");
      const formRequestId = formData.get("requestId") as string | null;
      const requestId = headerRequestId || formRequestId || crypto.randomUUID();

      const audioBuffer =
        typeof audioFile.arrayBuffer === "function"
          ? await audioFile.arrayBuffer()
          : typeof (audioFile as unknown as { bytes?: () => Promise<Uint8Array> }).bytes === "function"
          ? (await (audioFile as unknown as { bytes: () => Promise<Uint8Array> }).bytes()).buffer
          : new TextEncoder().encode(await audioFile.text()).buffer;
      const audioBytes = new Uint8Array(audioBuffer);

      // Compute SHA-256 hash of audio bytes
      const digest = await crypto.subtle.digest("SHA-256", audioBytes);
      const audioHash = Array.from(new Uint8Array(digest), (b) =>
        b.toString(16).padStart(2, "0")
      ).join("");

      // Reserve atomic duration quota
      const reservation = await rpc("reserve_stt_usage", {
        p_user: userId,
        p_request: requestId,
        p_hash: audioHash,
        p_duration_ms: durationMs,
        p_source: source,
      });

      if (reservation.code === "RECOVERED") {
        return reply({
          schemaVersion: 1,
          transcript: reservation.transcript,
          language: reservation.language || "en-US",
          durationMs: reservation.durationMs,
          quota: reservation.quota,
        });
      }

      if (reservation.code !== "RESERVED") {
        return fail(
          reservation.code as SttErrorCode,
          undefined,
          { quota: reservation.quota, terminal: reservation.terminal === true }
        );
      }

      // Provider call (Gemini 3.5 Transcribe)
      try {
        const providerResult = await deps.provider.transcribe(
          audioBytes,
          canonicalMime,
          reservation.model,
          req.signal
        );

        const finalized = await rpc("finalize_stt_usage", {
          p_user: userId,
          p_request: requestId,
          p_transcript: providerResult.transcript,
          p_attempt: learningAttemptId,
          p_duration_ms: durationMs,
          p_input: providerResult.inputTokens ?? null,
          p_output: providerResult.outputTokens ?? null,
          p_latency: Math.round(performance.now() - start),
        });

        if (finalized.code !== "succeeded") {
          return fail("SERVER_ERROR", undefined, { quota: finalized.quota, terminal: true });
        }

        return reply({
          schemaVersion: 1,
          transcript: finalized.transcript,
          language: providerResult.language || "en-US",
          durationMs: finalized.durationMs,
          quota: finalized.quota,
        });
      } catch (error) {
        const errorCode: SttErrorCode =
          error instanceof SttProviderError
            ? error.code
            : error instanceof Error && error.message === "EMPTY_TRANSCRIPT"
              ? "EMPTY_TRANSCRIPT"
              : "SERVER_ERROR";

        try {
          const finalized = await rpc("finalize_stt_usage", {
            p_user: userId,
            p_request: requestId,
            p_error: errorCode,
            p_latency: Math.round(performance.now() - start),
          });

          return fail(errorCode, undefined, {
            quota: finalized.quota,
            terminal: true,
            quotaConsumed: false,
          });
        } catch {
          return fail("SERVER_ERROR");
        }
      }
    } catch {
      return fail("SERVER_ERROR");
    }
  };
}
