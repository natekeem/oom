import type { SttSettings } from "../../types";
import { SttError } from "./errors";
import { executeCustomStt, transcribeAudio } from "../../lib/stt";

export interface CustomSttExecutionOptions {
  customSettings?: SttSettings | null;
  blob: Blob;
  mimeType: string;
  signal?: AbortSignal;
}

export async function executeCustomSttProvider(
  options: CustomSttExecutionOptions
): Promise<{ transcript: string; model?: string }> {
  if (!options.customSettings) {
    throw new SttError("CUSTOM_STT_INVALID", "사용자 지정 STT 설정이 없습니다.", 400);
  }

  const transcript = await transcribeAudio(
    options.customSettings,
    options.blob,
    options.mimeType,
    options.signal
  );

  return {
    transcript,
    model: options.customSettings.model || "custom",
  };
}

export { executeCustomStt, transcribeAudio };
