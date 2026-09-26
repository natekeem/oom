import type { LlmSettings } from "../../types";
import { AiExecutionError } from "./errors";

export type ResolvedAiProvider = "managed" | "custom";

function isRequestUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ||
      (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname));
  } catch {
    return false;
  }
}

export function hasCustomAiConfiguration(settings: LlmSettings) {
  return settings.endpoint.trim().length > 0;
}

export function isUsableCustomAiConfiguration(settings: LlmSettings) {
  return (
    hasCustomAiConfiguration(settings) &&
    isRequestUrl(settings.endpoint.trim()) &&
    (settings.mode !== "custom" || Boolean(settings.customBodyTemplate?.trim()))
  );
}

export function resolveAiProvider(settings: LlmSettings): ResolvedAiProvider {
  if (!hasCustomAiConfiguration(settings)) return "managed";
  if (!isUsableCustomAiConfiguration(settings))
    throw new AiExecutionError("CUSTOM_CONFIG_INVALID", null, true);
  return "custom";
}

export function getAiConnection(settings: LlmSettings) {
  try {
    const source = resolveAiProvider(settings);
    return source === "custom"
      ? { source, label: "사용자 API", detail: "설정한 API를 우선 사용" }
      : { source, label: "OOM 관리형 AI", detail: "기본 연결" };
  } catch {
    return { source: "custom" as const, label: "사용자 API", detail: "설정 확인 필요" };
  }
}
