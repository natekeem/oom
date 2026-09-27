import type { SttSettings } from "../types";
import { SttError } from "../features/stt/errors";

/**
 * Custom STT execution helper for user-configured endpoints (OpenAI-compatible Whisper / speech-to-text API).
 */
export async function executeCustomStt(
  settings: SttSettings,
  blob: Blob,
  mimeType: string,
  signal?: AbortSignal
): Promise<string> {
  if (!settings.endpoint?.trim()) {
    throw new SttError("CUSTOM_STT_INVALID", "AI 설정에서 STT Endpoint URL을 입력해 주세요.", 400);
  }

  const formData = new FormData();
  let extension = "webm";
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) {
    extension = "mp4";
  } else if (mimeType.includes("wav")) {
    extension = "wav";
  } else if (mimeType.includes("ogg")) {
    extension = "ogg";
  }

  const audioFile = new File([blob], `speaking_attempt.${extension}`, {
    type: mimeType || "audio/webm",
  });
  formData.append("file", audioFile);

  if (settings.model?.trim()) {
    formData.append("model", settings.model.trim());
  }

  formData.append("response_format", "text");

  const headers: Record<string, string> = {};
  if (settings.apiKey?.trim() && settings.authType === "bearer") {
    headers.Authorization = `Bearer ${settings.apiKey.trim()}`;
  } else if (settings.apiKey?.trim() && settings.authType === "x-api-key") {
    headers["x-api-key"] = settings.apiKey.trim();
  }

  let response: Response;
  try {
    response = await fetch(settings.endpoint.trim(), {
      method: "POST",
      headers,
      body: formData,
      signal,
    });
  } catch (error) {
    if (signal?.aborted) {
      throw new SttError("CUSTOM_STT_FAILED", "STT 요청이 취소되었습니다.", 499, error);
    }
    const message = error instanceof Error ? error.message : "네트워크 요청에 실패했습니다.";
    throw new SttError(
      "CUSTOM_STT_FAILED",
      `사용자 지정 STT 서버 요청에 실패했습니다: ${message}`,
      502,
      error
    );
  }

  const raw = await response.text();

  if (!response.ok) {
    throw new SttError(
      "CUSTOM_STT_FAILED",
      `사용자 지정 STT 요청이 상태 코드 ${response.status}로 실패했습니다. 연결 설정을 확인해 주세요.`,
      response.status
    );
  }

  let textResult = raw.trim();
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      const candidate =
        (typeof parsed.text === "string" ? parsed.text : undefined) ??
        (typeof parsed.transcript === "string" ? parsed.transcript : undefined) ??
        (typeof parsed.output_text === "string" ? parsed.output_text : undefined);
      if (candidate !== undefined) {
        textResult = candidate.trim();
      }
    }
  } catch {
    // response_format=text returns plain text directly
  }

  if (!textResult) {
    throw new SttError(
      "EMPTY_TRANSCRIPT",
      "사용자 지정 STT 응답에서 변환된 텍스트를 찾지 못했습니다. 서버 응답이 비어 있거나 형식이 다를 수 있습니다.",
      502
    );
  }

  return textResult;
}

/**
 * Legacy/direct helper for custom STT endpoints.
 * Preferred entry point for general transcription is `runStt` from `src/features/stt/runStt`.
 */
export async function transcribeAudio(
  settings: SttSettings,
  blob: Blob,
  mimeType: string,
  signal?: AbortSignal
): Promise<string> {
  return executeCustomStt(settings, blob, mimeType, signal);
}
