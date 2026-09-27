import type { SttProviderSource } from "../../../shared/stt/types";
import type { SttSettings } from "../../types";

export function hasCustomSttConfiguration(settings?: SttSettings | null): boolean {
  return Boolean(settings?.endpoint?.trim());
}

/**
 * Feature-detect true browser on-device SpeechRecognition (processLocally support).
 * Ordinary server-backed Web Speech is NOT considered local.
 */
export function isLocalOnDeviceSttSupported(): boolean {
  if (typeof window === "undefined") return false;

  const SpeechRecognitionClass =
    (window as unknown as { SpeechRecognition?: { available?: unknown; prototype?: unknown } }).SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: { available?: unknown; prototype?: unknown } }).webkitSpeechRecognition;

  if (!SpeechRecognitionClass) return false;

  // Modern on-device check: static available() method or processLocally in prototype
  const hasStaticAvailable = typeof SpeechRecognitionClass.available === "function";
  const hasProcessLocallyProp = Boolean(
    SpeechRecognitionClass.prototype &&
      typeof SpeechRecognitionClass.prototype === "object" &&
      "processLocally" in (SpeechRecognitionClass.prototype as Record<string, unknown>)
  );

  return Boolean(hasStaticAvailable || hasProcessLocallyProp);
}

export interface ResolveSttProviderOptions {
  customSettings?: SttSettings | null;
  preferLocalOnDevice?: boolean;
}

export function resolveSttProvider(options?: ResolveSttProviderOptions): SttProviderSource {
  // 1. Usable user Custom STT configured -> Custom STT wins
  if (hasCustomSttConfiguration(options?.customSettings)) {
    return "custom";
  }

  // 2. Optional Local On-device mode explicitly selected and available
  const preferLocal = options?.preferLocalOnDevice ?? options?.customSettings?.preferLocalOnDevice;
  if (preferLocal && isLocalOnDeviceSttSupported()) {
    return "browser_local";
  }

  // 3. Otherwise -> OOM Managed STT
  return "managed";
}

export interface SttConnectionStatus {
  source: SttProviderSource;
  label: string;
  detail: string;
  badgeTone: "amber" | "indigo" | "emerald";
}

export function getSttConnection(settings?: SttSettings | null): SttConnectionStatus {
  if (hasCustomSttConfiguration(settings)) {
    return {
      source: "custom",
      label: "사용자 지정 STT API",
      detail: "직접 설정한 Endpoint 우선",
      badgeTone: "amber",
    };
  }

  if (settings?.preferLocalOnDevice && isLocalOnDeviceSttSupported()) {
    return {
      source: "browser_local",
      label: "기기 내 음성 인식",
      detail: "브라우저 온디바이스 처리",
      badgeTone: "emerald",
    };
  }

  return {
    source: "managed",
    label: "OOM 관리형 STT",
    detail: "Gemini 3.5 Transcribe 기본",
    badgeTone: "indigo",
  };
}
