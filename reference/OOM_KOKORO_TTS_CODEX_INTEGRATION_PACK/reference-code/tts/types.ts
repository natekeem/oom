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
  engine: "kokoro" | "web-speech";
  voice: OomVoiceId;
  fallback?: boolean;
};

export interface TtsEngine {
  generate(input: TtsGenerateInput): Promise<TtsAudio>;
}
