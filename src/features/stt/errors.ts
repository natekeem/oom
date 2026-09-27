import type { SttErrorCode } from "../../../shared/stt/types";

export const STT_ERROR_MESSAGES: Record<SttErrorCode, string> = {
  LOGIN_REQUIRED: "로그인 후 OOM 관리형 음성 인식을 이용할 수 있습니다.",
  STT_DISABLED: "현재 관리형 STT 점검 중입니다. 잠시 후 다시 시도해 주세요.",
  CUSTOM_STT_INVALID: "사용자 지정 STT Endpoint 또는 설정 값을 확인해 주세요.",
  CUSTOM_STT_FAILED: "사용자 지정 STT 서버 요청에 실패했습니다.",
  LOCAL_STT_UNAVAILABLE: "현재 브라우저에서는 온디바이스 음성 인식(processLocally)을 지원하지 않습니다.",
  LOCAL_LANGUAGE_PACK_REQUIRED: "기기 내 음성 인식을 위한 브라우저 언어팩 설치가 필요합니다.",
  AUDIO_TOO_LONG: "녹음 시간이 허용 한도를 초과했습니다.",
  AUDIO_TOO_LARGE: "오디오 파일 크기가 허용 한도(25MB)를 초과했습니다.",
  UNSUPPORTED_AUDIO_FORMAT: "지원하지 않는 오디오 형식입니다.",
  DAILY_STT_QUOTA_EXCEEDED: "오늘 제공된 무료 관리형 STT 훈련 시간(10분)을 모두 소진했습니다.",
  RATE_LIMITED: "요청이 너무 빠릅니다. 잠시 후 다시 시도해 주세요.",
  REQUEST_IN_PROGRESS: "이전 음성 변환 요청이 이미 진행 중입니다.",
  PROVIDER_TIMEOUT: "음성 인식 처리 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.",
  PROVIDER_UNAVAILABLE: "음성 인식 제공자 서비스가 일시적으로 원활하지 않습니다.",
  EMPTY_TRANSCRIPT: "음성에서 인식된 텍스트가 없습니다. 마이크 입력 상태를 확인하고 다시 말해 보세요.",
  SERVER_ERROR: "서버 내부 오류로 음성 변환을 완료하지 못했습니다.",
  IDEMPOTENCY_CONFLICT: "동일한 요청 식별자에 다른 오디오가 전달되었습니다.",
};

export class SttError extends Error {
  readonly code: SttErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: SttErrorCode, message?: string, status = 500, details?: unknown) {
    super(message || STT_ERROR_MESSAGES[code] || "음성 인식 요청에 실패했습니다.");
    this.name = "SttError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function toSttError(error: unknown): SttError {
  if (error instanceof SttError) {
    return error;
  }
  if (error instanceof Error) {
    return new SttError("SERVER_ERROR", error.message, 500, error);
  }
  return new SttError("SERVER_ERROR", "알 수 없는 오류가 발생했습니다.", 500, error);
}

export function formatSttErrorMessage(error: unknown): string {
  if (error instanceof SttError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "음성 변환 중 알 수 없는 오류가 발생했습니다.";
}
