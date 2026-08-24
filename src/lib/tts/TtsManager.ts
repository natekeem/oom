import { speakText, type SpeechCallbacks } from "../speech";
import { KokoroBrowserEngine } from "./KokoroBrowserEngine";
import type {
  TtsEngine,
  TtsGenerateInput,
  TtsPlaybackSource,
  TtsStatusListener,
} from "./types";

const MAX_SESSION_AUDIO_CACHE_ENTRIES = 8;

type FallbackSpeak = (
  text: string,
  rate: number,
  callbacks?: SpeechCallbacks,
) => SpeechSynthesisUtterance;

export class TtsManager {
  private readonly audioCache = new Map<string, Blob>();

  constructor(
    private readonly engine: TtsEngine = new KokoroBrowserEngine(),
    private readonly fallbackSpeak: FallbackSpeak = speakText,
  ) {}

  private getCacheKey(input: TtsGenerateInput) {
    return `${input.voice}\u0000${input.speed ?? 1}\u0000${input.text}`;
  }

  private remember(key: string, blob: Blob) {
    this.audioCache.delete(key);
    this.audioCache.set(key, blob);

    while (this.audioCache.size > MAX_SESSION_AUDIO_CACHE_ENTRIES) {
      const oldestKey = this.audioCache.keys().next().value;
      if (typeof oldestKey !== "string") break;
      this.audioCache.delete(oldestKey);
    }
  }

  async preparePlayback(
    input: TtsGenerateInput,
    onStatus?: TtsStatusListener,
  ): Promise<TtsPlaybackSource> {
    const key = this.getCacheKey(input);
    const cached = this.audioCache.get(key);

    if (cached) {
      onStatus?.({ phase: "ready" });
      return {
        kind: "audio",
        blob: cached,
        voice: input.voice,
        engine: "kokoro",
        cached: true,
      };
    }

    try {
      const audio = await this.engine.generate(input, onStatus);
      this.remember(key, audio.blob);
      return {
        kind: "audio",
        blob: audio.blob,
        voice: audio.voice,
        engine: "kokoro",
        cached: false,
      };
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error(String(error));
      onStatus?.({ phase: "fallback" });
      return {
        kind: "web-speech",
        voice: input.voice,
        fallback: true,
        error: normalized,
        play: (callbacks) => {
          this.fallbackSpeak(input.text, input.speed ?? 1, callbacks);
        },
      };
    }
  }

  clearAudioCache() {
    this.audioCache.clear();
  }

  dispose() {
    this.audioCache.clear();
    this.engine.dispose?.();
  }
}

let defaultManager: TtsManager | null = null;

export function getTtsManager() {
  if (!defaultManager) defaultManager = new TtsManager();
  return defaultManager;
}

export function resetTtsManagerForTests() {
  defaultManager?.dispose();
  defaultManager = null;
}
