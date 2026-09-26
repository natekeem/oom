import type { AiQuota } from "../../../shared/managed-ai/feedback";

export type AiErrorCode =
  | "LOGIN_REQUIRED"
  | "AI_DISABLED"
  | "DAILY_QUOTA_EXCEEDED"
  | "RATE_LIMITED"
  | "CUSTOM_CONFIG_INVALID"
  | "CUSTOM_PROVIDER_FAILED"
  | "PROVIDER_TIMEOUT"
  | "PROVIDER_UNAVAILABLE"
  | "INVALID_AI_RESPONSE"
  | "INVALID_REQUEST"
  | "REQUEST_IN_PROGRESS"
  | "IDEMPOTENCY_CONFLICT"
  | "SERVER_ERROR";

export const aiErrorMessages: Record<AiErrorCode, string> = {
  LOGIN_REQUIRED: "로그인하면 OOM 관리형 AI를 이용할 수 있어요.",
  AI_DISABLED: "현재 OOM 관리형 AI를 잠시 사용할 수 없습니다. 기본 훈련은 계속 이용할 수 있어요.",
  DAILY_QUOTA_EXCEEDED: "오늘 이 기능의 OOM 관리형 AI 사용량을 모두 사용했어요. 내일 다시 이용할 수 있어요.",
  RATE_LIMITED: "요청이 많아요. 잠시 후 다시 시도해 주세요.",
  CUSTOM_CONFIG_INVALID: "사용자 API 설정이 올바르지 않습니다. Endpoint와 요청 형식을 확인해 주세요.",
  CUSTOM_PROVIDER_FAILED: "사용자 API 요청에 실패했습니다. 설정과 해당 서비스의 CORS 정책을 확인해 주세요.",
  PROVIDER_TIMEOUT: "AI 응답 시간이 길어졌어요. 잠시 후 다시 시도해 주세요.",
  PROVIDER_UNAVAILABLE: "AI 응답을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
  INVALID_AI_RESPONSE: "AI 응답 형식을 확인할 수 없습니다. 다시 시도해 주세요.",
  INVALID_REQUEST: "요청 내용을 확인해 주세요.",
  REQUEST_IN_PROGRESS: "같은 요청을 처리하고 있어요. 잠시 후 다시 확인해 주세요.",
  IDEMPOTENCY_CONFLICT: "요청 내용이 변경되었어요. 새 요청으로 다시 시도해 주세요.",
  SERVER_ERROR: "AI 요청을 완료하지 못했습니다. 다시 시도해 주세요.",
};

export class AiExecutionError extends Error {
  constructor(
    public code: AiErrorCode,
    public providerSource: "managed" | "custom" | null,
    public terminal = false,
    public quota?: AiQuota,
    public quotaConsumed?: boolean,
  ) {
    super(aiErrorMessages[code]);
  }
}

export function toAiExecutionError(
  error: unknown,
  source: "managed" | "custom" | null,
): AiExecutionError {
  if (error instanceof AiExecutionError) return error;
  return new AiExecutionError(
    source === "custom" ? "CUSTOM_PROVIDER_FAILED" : "SERVER_ERROR",
    source,
  );
}
