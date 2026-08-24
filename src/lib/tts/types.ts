export const OOM_VOICE_IDS = [
  "af_heart",
  "af_bella",
  "af_sarah",
  "af_sky",
] as const;

export type OomVoiceId = (typeof OOM_VOICE_IDS)[number];

export type TtsPreferences = {
  examVoice: OomVoiceId;
  scriptVoice: OomVoiceId;
};

export type TtsGenerateInput = {
  text: string;
  voice: OomVoiceId;
  speed?: number;
};

export type TtsAudio = {
  blob: Blob;
  mimeType: string;
  engine: "kokoro";
  voice: OomVoiceId;
  audioDurationSeconds?: number;
  chunkCount?: number;
  engineGenerationMs?: number;
};

export type TtsRuntimePhase =
  | "loading-model"
  | "generating"
  | "ready"
  | "fallback";

export type TtsRuntimeStatus = {
  phase: TtsRuntimePhase;
  progress?: number;
  completedChunks?: number;
  totalChunks?: number;
};

export type TtsStatusListener = (status: TtsRuntimeStatus) => void;

export interface TtsEngine {
  generate(input: TtsGenerateInput, onStatus?: TtsStatusListener): Promise<TtsAudio>;
  dispose?: () => void;
}

export type TtsFallbackCallbacks = {
  onEnd?: () => void;
  onError?: (error: unknown) => void;
};

export type TtsPlaybackSource =
  | {
      kind: "audio";
      blob: Blob;
      voice: OomVoiceId;
      engine: "kokoro";
      cached: boolean;
      cacheHit: "memory" | "indexeddb" | "miss";
    }
  | {
      kind: "web-speech";
      voice: OomVoiceId;
      fallback: true;
      error: Error;
      play: (callbacks?: TtsFallbackCallbacks) => void;
    };
