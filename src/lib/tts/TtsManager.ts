import { speakText, type SpeechCallbacks } from "../speech";
import { createTtsCacheIdentity, type TtsCacheIdentity } from "./cacheKey";
import { KokoroBrowserEngine } from "./KokoroBrowserEngine";
import {
  IndexedDbAudioCache,
  type PersistentAudioCache,
  type PersistentAudioCacheRecord,
} from "./persistentAudioCache";
import type {
  TtsAudio,
  TtsEngine,
  TtsGenerateInput,
  TtsPlaybackSource,
  TtsRuntimeStatus,
  TtsStatusListener,
} from "./types";

const MAX_SESSION_AUDIO_CACHE_ENTRIES = 8;

type FallbackSpeak = (
  text: string,
  rate: number,
  callbacks?: SpeechCallbacks,
) => SpeechSynthesisUtterance;

type InFlightPlayback = {
  promise: Promise<TtsPlaybackSource>;
  listeners: Set<TtsStatusListener>;
  latestStatus?: TtsRuntimeStatus;
};

function now() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function debugCacheFailure(operation: "read" | "write" | "clear", error: unknown) {
  if (!import.meta.env.DEV) return;
  console.debug(`[OOM TTS] IndexedDB cache ${operation} skipped`, error);
}

function debugPerformance(input: {
  request: TtsGenerateInput;
  record: PersistentAudioCacheRecord;
  generationMs: number;
  cacheHit: "memory" | "indexeddb" | "miss";
  engineGenerationMs?: number;
}) {
  if (!import.meta.env.DEV) return;

  const audioDurationSeconds = input.record.audioDurationSeconds;
  const record = {
    textChars: input.request.text.length,
    chunks: input.record.chunkCount,
    voice: input.request.voice,
    rate: input.request.speed ?? 1,
    generationMs: Math.round(input.generationMs),
    engineGenerationMs:
      typeof input.engineGenerationMs === "number"
        ? Math.round(input.engineGenerationMs)
        : undefined,
    audioDurationSeconds:
      typeof audioDurationSeconds === "number"
        ? Number(audioDurationSeconds.toFixed(1))
        : undefined,
    generationAudioRatio:
      typeof audioDurationSeconds === "number" && audioDurationSeconds > 0
        ? Number((input.generationMs / 1000 / audioDurationSeconds).toFixed(2))
        : undefined,
    cacheHit: input.cacheHit,
  };
  console.debug("[OOM TTS]", JSON.stringify(record));
}

export class TtsManager {
  private readonly audioCache = new Map<string, PersistentAudioCacheRecord>();
  private readonly inFlight = new Map<string, InFlightPlayback>();

  constructor(
    private readonly engine: TtsEngine = new KokoroBrowserEngine(),
    private readonly fallbackSpeak: FallbackSpeak = speakText,
    private readonly persistentCache: PersistentAudioCache = new IndexedDbAudioCache(),
  ) {}

  private remember(record: PersistentAudioCacheRecord) {
    this.audioCache.delete(record.key);
    this.audioCache.set(record.key, record);

    while (this.audioCache.size > MAX_SESSION_AUDIO_CACHE_ENTRIES) {
      const oldestKey = this.audioCache.keys().next().value;
      if (typeof oldestKey !== "string") break;
      this.audioCache.delete(oldestKey);
    }
  }

  private readMemory(identity: TtsCacheIdentity) {
    const cached = this.audioCache.get(identity.key);
    if (!cached) return null;

    const accessed = { ...cached, lastAccessedAt: Date.now() };
    this.remember(accessed);
    void this.persistentCache.set(accessed).catch((error) => debugCacheFailure("write", error));
    return accessed;
  }

  private isExactRecord(record: PersistentAudioCacheRecord, identity: TtsCacheIdentity) {
    return (
      record.key === identity.key &&
      record.modelVersion === identity.modelVersion &&
      record.voice === identity.voice &&
      record.rate === identity.rate &&
      record.textHash === identity.textHash
    );
  }

  private audioSource(
    record: PersistentAudioCacheRecord,
    cacheHit: "memory" | "indexeddb" | "miss",
  ): TtsPlaybackSource {
    return {
      kind: "audio",
      blob: record.blob,
      voice: record.voice,
      engine: "kokoro",
      cached: cacheHit !== "miss",
      cacheHit,
    };
  }

  private async prepareUncachedPlayback(
    input: TtsGenerateInput,
    identity: TtsCacheIdentity,
    emitStatus: (status: TtsRuntimeStatus) => void,
    startedAt: number,
  ): Promise<TtsPlaybackSource> {
    try {
      const persistent = await this.persistentCache.get(identity.key);
      if (persistent && this.isExactRecord(persistent, identity)) {
        this.remember(persistent);
        emitStatus({ phase: "ready" });
        debugPerformance({
          request: input,
          record: persistent,
          generationMs: 0,
          cacheHit: "indexeddb",
        });
        return this.audioSource(persistent, "indexeddb");
      }
    } catch (error) {
      debugCacheFailure("read", error);
    }

    try {
      const audio: TtsAudio = await this.engine.generate(input, emitStatus);
      const timestamp = Date.now();
      const record: PersistentAudioCacheRecord = {
        key: identity.key,
        blob: audio.blob,
        createdAt: timestamp,
        lastAccessedAt: timestamp,
        byteSize: audio.blob.size,
        modelVersion: identity.modelVersion,
        voice: identity.voice,
        rate: identity.rate,
        textHash: identity.textHash,
        audioDurationSeconds: audio.audioDurationSeconds,
        chunkCount: audio.chunkCount,
      };

      this.remember(record);
      try {
        await this.persistentCache.set(record);
      } catch (error) {
        debugCacheFailure("write", error);
      }

      debugPerformance({
        request: input,
        record,
        generationMs: now() - startedAt,
        engineGenerationMs: audio.engineGenerationMs,
        cacheHit: "miss",
      });
      return this.audioSource(record, "miss");
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error(String(error));
      emitStatus({ phase: "fallback" });
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

  async preparePlayback(
    input: TtsGenerateInput,
    onStatus?: TtsStatusListener,
  ): Promise<TtsPlaybackSource> {
    const startedAt = now();
    const identity = await createTtsCacheIdentity(input);
    const memory = this.readMemory(identity);

    if (memory) {
      onStatus?.({ phase: "ready" });
      debugPerformance({
        request: input,
        record: memory,
        generationMs: 0,
        cacheHit: "memory",
      });
      return this.audioSource(memory, "memory");
    }

    const existing = this.inFlight.get(identity.key);
    if (existing) {
      if (onStatus) {
        existing.listeners.add(onStatus);
        if (existing.latestStatus) onStatus(existing.latestStatus);
      }
      return existing.promise;
    }

    const listeners = new Set<TtsStatusListener>();
    if (onStatus) listeners.add(onStatus);
    const entry: InFlightPlayback = {
      listeners,
      promise: Promise.resolve({} as TtsPlaybackSource),
    };
    const emitStatus = (status: TtsRuntimeStatus) => {
      entry.latestStatus = status;
      entry.listeners.forEach((listener) => listener(status));
    };

    entry.promise = this.prepareUncachedPlayback(input, identity, emitStatus, startedAt).finally(
      () => {
        if (this.inFlight.get(identity.key) === entry) this.inFlight.delete(identity.key);
      },
    );
    this.inFlight.set(identity.key, entry);
    return entry.promise;
  }

  clearAudioCache() {
    this.audioCache.clear();
  }

  async clearPersistentAudioCache() {
    try {
      await this.persistentCache.clear?.();
    } catch (error) {
      debugCacheFailure("clear", error);
    }
  }

  dispose() {
    this.audioCache.clear();
    this.inFlight.clear();
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
