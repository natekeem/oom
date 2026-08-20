import type { SttSettings } from "../types";

export async function transcribeAudio(
  settings: SttSettings,
  blob: Blob,
  mimeType: string,
  signal?: AbortSignal
): Promise<string> {
  if (!settings.endpoint?.trim()) {
    throw new Error("AI 설정에서 STT Endpoint URL을 입력해 주세요.");
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
      throw new Error("STT 요청이 취소되었습니다.", { cause: error });
    }
    const message = error instanceof Error ? error.message : "네트워크 요청에 실패했습니다.";
    throw new Error(`STT 요청에 실패했습니다: ${message}`, { cause: error });
  }

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(
      `STT 요청이 상태 코드 ${response.status}로 실패했습니다. ${raw.slice(0, 200)}`
    );
  }

  let textResult = raw.trim();
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      if (typeof parsed.text === "string") {
        textResult = parsed.text.trim();
      } else if (typeof parsed.transcript === "string") {
        textResult = parsed.transcript.trim();
      }
    }
  } catch {
    // response_format=text returns plain text directly
  }

  return textResult;
}
