import { supabase } from "../../lib/supabase";
import {
  parseFeedback,
  type AiQuota,
  type FeedbackInput,
  type ManagedAiFeedbackV1,
} from "../../../supabase/functions/_shared/feedback";
export type { AiQuota, ManagedAiFeedbackV1 };
export const aiMessages: Record<string, string> = {
  LOGIN_REQUIRED: "로그인하면 OOM AI 피드백을 이용할 수 있어요.",
  AI_DISABLED:
    "현재 AI 피드백을 잠시 사용할 수 없습니다. 학습 기능은 계속 이용할 수 있어요.",
  NO_TEXT_INPUT:
    "받아쓴 답변을 확인하거나 직접 입력해 주세요. 녹음만으로는 AI 피드백을 받을 수 없어요.",
  DAILY_QUOTA_EXCEEDED:
    "오늘 무료 AI 피드백을 모두 사용했어요. 내일 다시 이용할 수 있어요.",
  RATE_LIMITED: "요청이 많아요. 1분 뒤 다시 시도해 주세요.",
  REQUEST_IN_PROGRESS:
    "이 답변을 분석하고 있어요. 잠시 후 결과를 다시 확인해 주세요.",
  INVALID_REQUEST:
    "질문과 답변을 확인해 주세요. 답변은 8,000자까지 입력할 수 있어요.",
  IDEMPOTENCY_CONFLICT: "답변이 변경되었어요. 새 답변으로 다시 요청해 주세요.",
  PROVIDER_TIMEOUT: "분석 시간이 길어졌어요. 잠시 후 다시 시도해 주세요.",
  PROVIDER_UNAVAILABLE:
    "피드백을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
  INVALID_AI_RESPONSE: "피드백을 불러오지 못했어요. 다시 시도해 주세요.",
  SERVER_ERROR: "피드백을 불러오지 못했어요. 다시 시도해 주세요.",
};
export class ManagedAiError extends Error {
  constructor(
    public code: string,
    public terminal = false,
    public quota?: AiQuota,
    public quotaConsumed?: boolean,
  ) {
    super(aiMessages[code] || aiMessages.SERVER_ERROR);
  }
}
async function request<T>(
  path: string,
  userId: string,
  signal: AbortSignal,
  body?: unknown,
): Promise<T> {
  const session = await supabase?.auth.getSession();
  if (!session?.data.session || session.data.session.user.id !== userId)
    throw new ManagedAiError("LOGIN_REQUIRED");
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL?.replace(/\/+$/, "")}/functions/v1/ai-api${path}`,
    {
      method: body ? "POST" : "GET",
      signal,
      headers: {
        Authorization: `Bearer ${session.data.session.access_token}`,
        "Content-Type": "application/json",
        "x-region": "ap-northeast-2",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    },
  );
  const data = await res.json();
  if (!res.ok)
    throw new ManagedAiError(
      data.error?.code || "SERVER_ERROR",
      data.terminal === true,
      data.quota,
      data.quotaConsumed,
    );
  return data;
}
export const getAiQuota = (userId: string, signal: AbortSignal) =>
  request<AiQuota>("/quota?feature=answer_feedback", userId, signal);
export async function getManagedFeedback(
  userId: string,
  input: FeedbackInput,
  signal: AbortSignal,
) {
  const result = await request<{ feedback: unknown; quota: AiQuota }>(
    "/feedback",
    userId,
    signal,
    input,
  );
  return { ...result, feedback: parseFeedback(result.feedback) };
}
