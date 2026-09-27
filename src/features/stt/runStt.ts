import type { RunSttOptions, RunSttResult } from "./contracts";
import { executeBrowserLocalStt } from "./browserLocalSttProvider";
import { transcribeAudio } from "../../lib/stt";
import { executeManagedStt } from "./managedSttProvider";
import { resolveSttProvider } from "./providerResolver";

export async function runStt({
  blob,
  mimeType,
  durationSeconds,
  source,
  learningAttemptId,
  customSettings,
  localModeRequested,
  requestId = crypto.randomUUID(),
  signal,
}: RunSttOptions): Promise<RunSttResult> {
  const providerSource = resolveSttProvider({
    customSettings,
    preferLocalOnDevice: localModeRequested,
  });

  if (providerSource === "custom") {
    const transcript = await transcribeAudio(customSettings!, blob, mimeType, signal);
    return {
      providerSource,
      transcript,
      durationMs: durationSeconds ? Math.round(durationSeconds * 1000) : undefined,
      requestId,
    };
  }

  if (providerSource === "browser_local") {
    const transcript = await executeBrowserLocalStt(blob, mimeType, signal);
    return {
      providerSource,
      transcript,
      durationMs: durationSeconds ? Math.round(durationSeconds * 1000) : undefined,
      requestId,
    };
  }

  // Managed provider
  const managed = await executeManagedStt({
    blob,
    mimeType,
    durationSeconds,
    source,
    learningAttemptId,
    requestId,
    signal,
  });

  return {
    providerSource,
    transcript: managed.result.transcript,
    language: managed.result.language,
    durationMs: managed.result.durationMs,
    quota: managed.quota,
    requestId,
  };
}
