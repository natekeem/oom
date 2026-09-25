import type { SupabaseClient } from "npm:@supabase/supabase-js@2.116.0";
import { parseFeedback, parseFeedbackInput } from "../../../shared/managed-ai/feedback.ts";
import { jsonResponse, withTiming } from "../admin-api/cors.ts";
import {
  ProviderError,
  type AiProvider,
  type ProviderResult,
} from "./provider.ts";

export interface AiDependencies {
  authenticate(
    req: Request,
  ): Promise<{ userId: string; db: SupabaseClient } | null>;
  provider: AiProvider;
}
export async function readBoundedJson(
  req: Request,
  maxBytes = 40000,
): Promise<unknown> {
  if (
    !req.headers.get("content-type")?.includes("application/json") ||
    Number(req.headers.get("content-length") || 0) > maxBytes
  )
    throw new Error("INVALID_REQUEST");
  const reader = req.body?.getReader();
  if (!reader) throw new Error("INVALID_REQUEST");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > maxBytes) {
        await reader.cancel();
        throw new Error("INVALID_REQUEST");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.length;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}
const codes: Record<string, number> = {
  LOGIN_REQUIRED: 401,
  INVALID_REQUEST: 400,
  NO_TEXT_INPUT: 400,
  AI_DISABLED: 503,
  DAILY_QUOTA_EXCEEDED: 429,
  RATE_LIMITED: 429,
  REQUEST_IN_PROGRESS: 409,
  IDEMPOTENCY_CONFLICT: 409,
  PROVIDER_TIMEOUT: 504,
  PROVIDER_UNAVAILABLE: 503,
  INVALID_AI_RESPONSE: 502,
  RESERVATION_EXPIRED: 503,
  SERVER_ERROR: 500,
};
export function createAiHandler(deps: AiDependencies) {
  return async (req: Request): Promise<Response> => {
    const start = performance.now();
    const reply = (data: unknown, status = 200) =>
      withTiming(jsonResponse(req, data, status), start);
    const fail = (code: string, extra = {}) =>
      reply(
        {
          error: { code, message: "AI 피드백 요청을 완료하지 못했습니다." },
          ...extra,
        },
        codes[code] || 500,
      );
    const origin = req.headers.get("origin");
    if (
      origin &&
      ![
        "https://opic-on-me.com",
        "http://localhost:5173",
        "http://localhost:4173",
      ].includes(origin)
    )
      return reply({ error: { code: "FORBIDDEN" } }, 403);
    if (req.method === "OPTIONS")
      return withTiming(
        new Response(null, {
          status: 204,
          headers: jsonResponse(req, {}).headers,
        }),
        start,
      );
    try {
      const auth = await deps.authenticate(req);
      if (!auth) return fail("LOGIN_REQUIRED");
      const { userId, db } = auth;
      const url = new URL(req.url);
      const path = url.pathname
        .replace(/^\/(?:functions\/v1\/)?ai-api/, "")
        .replace(/\/$/, "");
      const rpc = async (name: string, args: Record<string, unknown>) => {
        const { data, error } = await db.rpc(name, args);
        if (error) throw new Error("SERVER_ERROR");
        return data;
      };
      if (req.method === "GET" && path === "/quota") {
        if (url.searchParams.get("feature") !== "answer_feedback")
          return fail("INVALID_REQUEST");
        return reply(await rpc("ai_quota", { p_user: userId }));
      }
      if (req.method !== "POST" || path !== "/feedback")
        return reply({ error: { code: "NOT_FOUND" } }, 404);
      let input;
      try {
        const raw = await readBoundedJson(req);
        if (
          raw &&
          typeof raw === "object" &&
          "answer" in raw &&
          typeof raw.answer === "string" &&
          !raw.answer.trim()
        )
          return fail("NO_TEXT_INPUT");
        input = parseFeedbackInput(raw);
      } catch {
        return fail("INVALID_REQUEST");
      }
      if (input.learningAttemptId) {
        const { data, error } = await db
          .from("learning_attempts")
          .select("id")
          .eq("id", input.learningAttemptId)
          .eq("user_id", userId)
          .maybeSingle();
        if (error) return fail("SERVER_ERROR");
        if (!data) return fail("INVALID_REQUEST");
      }
      const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(
          JSON.stringify([
            input.question,
            input.context,
            input.answer,
            input.learningAttemptId || null,
          ]),
        ),
      );
      const hash = Array.from(new Uint8Array(digest), (b) =>
        b.toString(16).padStart(2, "0"),
      ).join("");
      const reservation = await rpc("reserve_ai_usage", {
        p_user: userId,
        p_request: input.requestId,
        p_hash: hash,
      });
      if (reservation.code === "RECOVERED")
        return reply({
          feedback: parseFeedback(reservation.feedback),
          quota: reservation.quota,
        });
      if (reservation.code !== "RESERVED")
        return fail(reservation.code, {
          quota: reservation.quota,
          terminal: reservation.terminal === true,
        });
      let result: ProviderResult | undefined;
      try {
        result = await deps.provider.generateFeedback(input, reservation.model);
        const feedback = parseFeedback(result.output);
        const args = {
          p_user: userId,
          p_request: input.requestId,
          p_feedback: feedback,
          p_attempt: input.learningAttemptId || null,
          p_input: result.inputTokens,
          p_output: result.outputTokens,
          p_thought: result.thoughtTokens ?? null,
          p_cached: result.cachedTokens,
          p_latency: Math.round(performance.now() - start),
        };
        // Retrying only the idempotent DB finalization recovers a lost commit response without a second provider call.
        let finalized;
        try {
          finalized = await rpc("finalize_ai_usage", args);
        } catch {
          finalized = await rpc("finalize_ai_usage", args);
        }
        if (finalized.code !== "succeeded")
          return fail("SERVER_ERROR", {
            quota: finalized.quota,
            terminal: true,
          });
        return reply({ feedback: finalized.feedback, quota: finalized.quota });
      } catch (err) {
        const code =
          err instanceof ProviderError
            ? err.code
            : err instanceof Error && err.message === "INVALID_AI_RESPONSE"
              ? "INVALID_AI_RESPONSE"
              : "SERVER_ERROR";
        const usage =
          result || (err instanceof ProviderError ? err.usage : undefined);
        try {
          const finalized = await rpc("finalize_ai_usage", {
            p_user: userId,
            p_request: input.requestId,
            p_error: code,
            p_input: usage?.inputTokens ?? null,
            p_output: usage?.outputTokens ?? null,
            p_thought: usage?.thoughtTokens ?? null,
            p_cached: usage?.cachedTokens ?? null,
            p_latency: Math.round(performance.now() - start),
          });
          // A success commit may have occurred even when both HTTP responses were lost.
          if (finalized.code === "succeeded")
            return reply({
              feedback: parseFeedback(finalized.feedback),
              quota: finalized.quota,
            });
          return fail(code, {
            quota: finalized.quota,
            terminal: true,
            quotaConsumed: false,
          });
        } catch {
          return fail("SERVER_ERROR");
        } // Keep UUID stable; lease recovery handles DB outage.
      }
    } catch {
      return fail("SERVER_ERROR");
    }
  };
}
