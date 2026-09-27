import type {
  ManagedTranscriptionV1,
  SttErrorCode,
  SttQuota,
  SttSource,
} from "../../../shared/stt/types";
import { supabase } from "../../lib/supabase";
import { SttError } from "./errors";

export interface ExecuteManagedSttOptions {
  blob: Blob;
  mimeType: string;
  durationSeconds?: number;
  source: SttSource;
  learningAttemptId?: string | null;
  requestId: string;
  signal?: AbortSignal;
}

export async function executeManagedStt({
  blob,
  mimeType,
  durationSeconds,
  source,
  learningAttemptId,
  requestId,
  signal,
}: ExecuteManagedSttOptions): Promise<{
  result: ManagedTranscriptionV1;
  quota?: SttQuota;
}> {
  const session = await supabase?.auth.getSession();
  if (!session?.data.session) {
    throw new SttError("LOGIN_REQUIRED", "로그인 후 OOM 관리형 음성 인식을 이용할 수 있습니다.", 401);
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

  const audioFile = new File([blob], `speaking_attempt_${requestId}.${extension}`, {
    type: mimeType || "audio/webm",
  });

  formData.append("audio", audioFile);
  formData.append("mimeType", mimeType || "audio/webm");
  formData.append(
    "durationMs",
    Math.round(Math.max(500, (durationSeconds ?? 0) * 1000)).toString()
  );
  formData.append("source", source);
  if (learningAttemptId) {
    formData.append("learningAttemptId", learningAttemptId);
  }
  formData.append("requestId", requestId);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/+$/, "");
  let response: Response;
  try {
    response = await fetch(`${supabaseUrl}/functions/v1/stt-api/transcribe`, {
      method: "POST",
      signal,
      headers: {
        Authorization: `Bearer ${session.data.session.access_token}`,
        "x-request-id": requestId,
        "x-region": "ap-northeast-2",
      },
      body: formData,
    });
  } catch (error) {
    if (signal?.aborted) {
      throw new SttError("PROVIDER_TIMEOUT", "음성 변환 요청이 취소되었습니다.", 499, error);
    }
    throw new SttError("PROVIDER_UNAVAILABLE", "음성 변환 서버에 연결할 수 없습니다.", 503, error);
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await response.json()) as Record<string, unknown>;
  } catch {
    throw new SttError("SERVER_ERROR", "서버 응답을 해석하지 못했습니다.", 500);
  }

  if (!response.ok) {
    const apiError = payload.error as { code?: SttErrorCode; message?: string } | undefined;
    const code = apiError?.code || "SERVER_ERROR";
    const msg = apiError?.message;
    throw new SttError(code, msg, response.status, payload);
  }

  const transcript = typeof payload.transcript === "string" ? payload.transcript.trim() : "";
  if (!transcript) {
    throw new SttError("EMPTY_TRANSCRIPT", "음성에서 인식된 텍스트가 없습니다.", 502);
  }

  return {
    result: {
      schemaVersion: 1,
      transcript,
      language: typeof payload.language === "string" ? payload.language : "en-US",
      durationMs: typeof payload.durationMs === "number" ? payload.durationMs : undefined,
    },
    quota: payload.quota as SttQuota | undefined,
  };
}

export async function getManagedSttQuota(signal?: AbortSignal): Promise<SttQuota> {
  const session = await supabase?.auth.getSession();
  if (!session?.data.session) {
    throw new SttError("LOGIN_REQUIRED", "로그인이 필요합니다.", 401);
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/+$/, "");
  const response = await fetch(`${supabaseUrl}/functions/v1/stt-api/quota`, {
    signal,
    headers: {
      Authorization: `Bearer ${session.data.session.access_token}`,
      "Content-Type": "application/json",
      "x-region": "ap-northeast-2",
    },
  });

  const payload = (await response.json()) as Record<string, unknown>;
  if (!response.ok) {
    const apiError = payload.error as { code?: SttErrorCode; message?: string } | undefined;
    throw new SttError(apiError?.code || "SERVER_ERROR", apiError?.message, response.status);
  }

  return payload as unknown as SttQuota;
}
