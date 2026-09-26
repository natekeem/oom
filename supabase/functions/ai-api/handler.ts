import type { SupabaseClient } from "npm:@supabase/supabase-js@2.116.0";
import {
  isAiFeature,
  parseAiExecuteRequest,
  parseAiFeatureInput,
  parseManagedFeatureResult,
  type AiExecuteRequest,
} from "../../../shared/ai/features.ts";
import { parseFeedbackInput } from "../../../shared/managed-ai/feedback.ts";
import { jsonResponse, withTiming } from "../admin-api/cors.ts";
import { managedFeatureRegistry, ProviderError, type AiProvider, type ProviderResult } from "./provider.ts";

export interface AiDependencies {
  authenticate(req: Request): Promise<{ userId: string; db: SupabaseClient } | null>;
  provider: AiProvider;
}

export async function readBoundedJson(req: Request, maxBytes = 40000): Promise<unknown> {
  if (!req.headers.get("content-type")?.includes("application/json") || Number(req.headers.get("content-length") || 0) > maxBytes)
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
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

const codes: Record<string, number> = {
  LOGIN_REQUIRED: 401, INVALID_REQUEST: 400, NO_TEXT_INPUT: 400, AI_DISABLED: 503,
  DAILY_QUOTA_EXCEEDED: 429, RATE_LIMITED: 429, REQUEST_IN_PROGRESS: 409,
  IDEMPOTENCY_CONFLICT: 409, PROVIDER_TIMEOUT: 504, PROVIDER_UNAVAILABLE: 503,
  INVALID_AI_RESPONSE: 502, RESERVATION_EXPIRED: 503, SERVER_ERROR: 500,
};

function legacyFeedbackRequest(raw: unknown): AiExecuteRequest<"answer_feedback"> {
  const parsed = parseFeedbackInput(raw);
  return {
    feature: "answer_feedback",
    requestId: parsed.requestId,
    input: parseAiFeatureInput("answer_feedback", {
      question: parsed.question,
      answer: parsed.answer,
      context: parsed.context,
      source: "quick_practice",
      learningAttemptId: parsed.learningAttemptId,
    }),
  };
}

async function hashRequest(request: AiExecuteRequest) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify([request.feature, request.input])));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function createAiHandler(deps: AiDependencies) {
  return async (req: Request): Promise<Response> => {
    const start = performance.now();
    const reply = (data: unknown, status = 200) => withTiming(jsonResponse(req, data, status), start);
    const fail = (code: string, extra = {}) => reply({ error: { code, message: "AI 요청을 완료하지 못했습니다." }, ...extra }, codes[code] || 500);
    const origin = req.headers.get("origin");
    if (origin && !["https://opic-on-me.com", "http://localhost:5173", "http://localhost:4173"].includes(origin))
      return reply({ error: { code: "FORBIDDEN" } }, 403);
    if (req.method === "OPTIONS") return withTiming(new Response(null, { status: 204, headers: jsonResponse(req, {}).headers }), start);
    try {
      const auth = await deps.authenticate(req);
      if (!auth) return fail("LOGIN_REQUIRED");
      const { userId, db } = auth;
      const url = new URL(req.url);
      const path = url.pathname.replace(/^\/(?:functions\/v1\/)?ai-api/, "").replace(/\/$/, "");
      const rpc = async (name: string, args: Record<string, unknown>) => {
        const { data, error } = await db.rpc(name, args);
        if (error) throw new Error("SERVER_ERROR");
        return data;
      };
      if (req.method === "GET" && path === "/quota") {
        const feature = url.searchParams.get("feature");
        if (!isAiFeature(feature)) return fail("INVALID_REQUEST");
        return reply(await rpc("ai_quota", { p_user: userId, p_feature: feature }));
      }
      const legacy = path === "/feedback";
      if (req.method !== "POST" || (!legacy && path !== "/execute")) return reply({ error: { code: "NOT_FOUND" } }, 404);
      let request: AiExecuteRequest;
      try {
        const raw = await readBoundedJson(req);
        request = legacy ? legacyFeedbackRequest(raw) : parseAiExecuteRequest(raw);
      } catch {
        return fail("INVALID_REQUEST");
      }
      if (request.feature === "answer_feedback" && request.input.learningAttemptId) {
        const { data, error } = await db.from("learning_attempts").select("id")
          .eq("id", request.input.learningAttemptId).eq("user_id", userId).maybeSingle();
        if (error) return fail("SERVER_ERROR");
        if (!data) return fail("INVALID_REQUEST");
      }
      const reservation = await rpc("reserve_ai_usage", {
        p_user: userId,
        p_request: request.requestId,
        p_hash: await hashRequest(request),
        p_feature: request.feature,
        p_prompt_version: managedFeatureRegistry[request.feature].promptVersion,
      });
      if (reservation.code === "RECOVERED") {
        const result = parseManagedFeatureResult(request.feature, reservation.result);
        return reply(legacy && result.format === "structured"
          ? { feedback: result.feedback, quota: reservation.quota }
          : { result: reservation.result, quota: reservation.quota });
      }
      if (reservation.code !== "RESERVED")
        return fail(reservation.code, { quota: reservation.quota, terminal: reservation.terminal === true });
      let providerResult: ProviderResult | undefined;
      try {
        providerResult = await deps.provider.generate(request.feature, request.input, reservation.model);
        const normalized = parseManagedFeatureResult(request.feature, providerResult.output);
        const storedResult = request.feature === "answer_feedback" && normalized.format === "structured" ? normalized.feedback : normalized;
        const args = {
          p_user: userId,
          p_request: request.requestId,
          p_result: storedResult,
          p_attempt: request.feature === "answer_feedback" ? request.input.learningAttemptId || null : null,
          p_input: providerResult.inputTokens,
          p_output: providerResult.outputTokens,
          p_thought: providerResult.thoughtTokens ?? null,
          p_cached: providerResult.cachedTokens,
          p_latency: Math.round(performance.now() - start),
        };
        let finalized;
        try { finalized = await rpc("finalize_ai_usage", args); }
        catch { finalized = await rpc("finalize_ai_usage", args); }
        if (finalized.code !== "succeeded") return fail("SERVER_ERROR", { quota: finalized.quota, terminal: true });
        return reply(legacy ? { feedback: finalized.result, quota: finalized.quota } : { result: finalized.result, quota: finalized.quota });
      } catch (error) {
        const code = error instanceof ProviderError ? error.code : error instanceof Error && error.message === "INVALID_AI_RESPONSE" ? "INVALID_AI_RESPONSE" : "SERVER_ERROR";
        const usage = providerResult || (error instanceof ProviderError ? error.usage : undefined);
        try {
          const finalized = await rpc("finalize_ai_usage", {
            p_user: userId, p_request: request.requestId, p_error: code,
            p_input: usage?.inputTokens ?? null, p_output: usage?.outputTokens ?? null,
            p_thought: usage?.thoughtTokens ?? null, p_cached: usage?.cachedTokens ?? null,
            p_latency: Math.round(performance.now() - start),
          });
          if (finalized.code === "succeeded")
            return reply(legacy ? { feedback: finalized.result, quota: finalized.quota } : { result: finalized.result, quota: finalized.quota });
          return fail(code, { quota: finalized.quota, terminal: true, quotaConsumed: false });
        } catch { return fail("SERVER_ERROR"); }
      }
    } catch { return fail("SERVER_ERROR"); }
  };
}
