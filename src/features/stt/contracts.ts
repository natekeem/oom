export * from "../../../shared/stt/types";
import type {
  SttProviderSource,
  SttQuota,
  SttSource,
} from "../../../shared/stt/types";
import type { SttSettings } from "../../types";

export interface RunSttOptions {
  blob: Blob;
  mimeType: string;
  durationSeconds?: number;
  source: SttSource;
  learningAttemptId?: string | null;
  customSettings?: SttSettings;
  localModeRequested?: boolean;
  requestId?: string;
  signal?: AbortSignal;
}

export interface RunSttResult {
  providerSource: SttProviderSource;
  transcript: string;
  language?: string;
  durationMs?: number;
  quota?: SttQuota;
  requestId: string;
}
