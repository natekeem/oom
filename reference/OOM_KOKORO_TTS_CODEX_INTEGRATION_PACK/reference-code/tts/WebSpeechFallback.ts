import type {
  TtsAudio,
  TtsEngine,
  TtsGenerateInput,
} from "./types";

/**
 * IMPORTANT:
 * Web Speech does not naturally return a Blob.
 *
 * This file is only a conceptual adapter marker.
 * In the real OOM repo, preserve the current Web Speech playback path
 * rather than forcing speechSynthesis into a fake Blob abstraction.
 *
 * Recommended:
 * TtsManager exposes:
 *   - generateBlob() for Kokoro
 *   - fallbackPlay() for Web Speech
 *
 * or a discriminated result:
 *   { kind: "audio", blob }
 *   { kind: "web-speech", play() }
 *
 * Codex should inspect the current OOM TTS code and choose the smallest
 * architecture that preserves the existing fallback.
 */
export class WebSpeechFallback implements TtsEngine {
  async generate(_input: TtsGenerateInput): Promise<TtsAudio> {
    throw new Error(
      "Reference only: preserve existing OOM speechSynthesis playback path.",
    );
  }
}
