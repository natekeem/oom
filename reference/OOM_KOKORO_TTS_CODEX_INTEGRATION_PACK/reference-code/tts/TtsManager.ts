import type { OomVoiceId } from "./types";

export type TtsPlaybackSource =
  | {
      kind: "audio";
      blob: Blob;
      voice: OomVoiceId;
      engine: "kokoro";
    }
  | {
      kind: "web-speech";
      voice: OomVoiceId;
      fallback: true;
    };

/**
 * Reference shape only.
 *
 * Real implementation should:
 * 1. try Kokoro
 * 2. if Kokoro fails, return a fallback marker
 * 3. consumer invokes existing Web Speech code
 *
 * Do not delete the existing OOM browser TTS implementation.
 */
