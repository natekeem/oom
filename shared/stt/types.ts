export type SttProviderSource = "custom" | "browser_local" | "managed";

export type SttSource = "quick_practice" | "roleplay" | "mock_review";

export type SttErrorCode =
  | "LOGIN_REQUIRED"
  | "STT_DISABLED"
  | "CUSTOM_STT_INVALID"
  | "CUSTOM_STT_FAILED"
  | "LOCAL_STT_UNAVAILABLE"
  | "LOCAL_LANGUAGE_PACK_REQUIRED"
  | "AUDIO_TOO_LONG"
  | "AUDIO_TOO_LARGE"
  | "UNSUPPORTED_AUDIO_FORMAT"
  | "DAILY_STT_QUOTA_EXCEEDED"
  | "RATE_LIMITED"
  | "REQUEST_IN_PROGRESS"
  | "PROVIDER_TIMEOUT"
  | "PROVIDER_UNAVAILABLE"
  | "EMPTY_TRANSCRIPT"
  | "SERVER_ERROR"
  | "IDEMPOTENCY_CONFLICT";

export interface ManagedTranscriptionV1 {
  schemaVersion: 1;
  transcript: string;
  language?: string;
  durationMs?: number;
}

export interface SttQuota {
  plan: "free" | "pro";
  limitMs: number;
  usedMs: number;
  reservedMs: number;
  remainingMs: number;
  resetsAt: string;
  enabled: boolean;
  defaultModel?: string;
}

export interface SttExecutionResult {
  providerSource: SttProviderSource;
  transcript: string;
  language?: string;
  durationMs?: number;
  quota?: SttQuota;
  requestId: string;
}

export const STT_SOURCES = ["quick_practice", "roleplay", "mock_review"] as const;

export const STT_MAX_DURATIONS_MS: Record<SttSource, number> = {
  quick_practice: 120_000,
  roleplay: 120_000,
  mock_review: 180_000,
};

export const STT_ALLOWED_MIME_TYPES = [
  "audio/webm",
  "audio/webm;codecs=opus",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/wav",
  "audio/ogg",
  "audio/ogg;codecs=opus",
  "audio/aac",
];
