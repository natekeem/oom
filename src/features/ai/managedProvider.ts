import {
  parseManagedFeatureResult,
  type AiExecuteRequest,
  type AiFeature,
  type AiFeatureInputMap,
  type AiFeatureResultMap,
} from "../../../shared/ai/features";
import type { AiQuota } from "../../../shared/managed-ai/feedback";
import { supabase } from "../../lib/supabase";
import { AiExecutionError, type AiErrorCode } from "./errors";

export async function executeManagedAi<F extends AiFeature>(
  feature: F,
  input: AiFeatureInputMap[F],
  requestId: string,
  signal?: AbortSignal,
): Promise<{ result: AiFeatureResultMap[F]; quota: AiQuota }> {
  const session = await supabase?.auth.getSession();
  if (!session?.data.session)
    throw new AiExecutionError("LOGIN_REQUIRED", "managed", true);
  const body: AiExecuteRequest<F> = { feature, input, requestId };
  let response: Response;
  try {
    response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL?.replace(/\/+$/, "")}/functions/v1/ai-api/execute`,
      {
        method: "POST",
        signal,
        headers: {
          Authorization: `Bearer ${session.data.session.access_token}`,
          "Content-Type": "application/json",
          "x-region": "ap-northeast-2",
        },
        body: JSON.stringify(body),
      },
    );
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new AiExecutionError("PROVIDER_UNAVAILABLE", "managed");
  }
  let payload: Record<string, unknown>;
  try {
    payload = (await response.json()) as Record<string, unknown>;
  } catch {
    throw new AiExecutionError("SERVER_ERROR", "managed");
  }
  if (!response.ok) {
    const apiError = payload.error as { code?: AiErrorCode } | undefined;
    throw new AiExecutionError(
      apiError?.code || "SERVER_ERROR",
      "managed",
      payload.terminal === true,
      payload.quota as AiQuota | undefined,
      payload.quotaConsumed as boolean | undefined,
    );
  }
  try {
    return {
      result: parseManagedFeatureResult(feature, payload.result),
      quota: payload.quota as AiQuota,
    };
  } catch {
    throw new AiExecutionError("INVALID_AI_RESPONSE", "managed");
  }
}

export async function getManagedAiQuota(
  feature: AiFeature,
  signal?: AbortSignal,
): Promise<AiQuota> {
  const session = await supabase?.auth.getSession();
  if (!session?.data.session)
    throw new AiExecutionError("LOGIN_REQUIRED", "managed", true);
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL?.replace(/\/+$/, "")}/functions/v1/ai-api/quota?feature=${feature}`,
    {
      signal,
      headers: {
        Authorization: `Bearer ${session.data.session.access_token}`,
        "Content-Type": "application/json",
      },
    },
  );
  const payload = await response.json();
  if (!response.ok)
    throw new AiExecutionError(payload.error?.code || "SERVER_ERROR", "managed");
  return payload as AiQuota;
}
