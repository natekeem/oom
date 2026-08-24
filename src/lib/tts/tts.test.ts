import { beforeEach, describe, expect, it, vi } from "vitest";
import { KokoroBrowserEngine } from "./KokoroBrowserEngine";
import { TtsManager } from "./TtsManager";
import { createTtsCacheIdentity } from "./cacheKey";
import { KOKORO_MODEL_VERSION } from "./kokoroConfig";
import {
  MAX_PERSISTENT_AUDIO_CACHE_ENTRIES,
  selectPersistentCacheKeysForEviction,
  type PersistentAudioCache,
  type PersistentAudioCacheRecord,
} from "./persistentAudioCache";
import {
  readTtsPreferences,
  TTS_PREFERENCES_STORAGE_KEY,
  writeTtsPreferences,
} from "./preferences";
import {
  DEFAULT_SCRIPT_RATE_BY_LEVEL,
  readScriptRate,
  readScriptRatePreferences,
  SCRIPT_RATE_PREFERENCES_STORAGE_KEY,
  writeScriptRate,
} from "./ratePreferences";
import type { TtsEngine, TtsPreferences, TtsRuntimeStatus } from "./types";
import { DEFAULT_TTS_PREFERENCES } from "./voiceConfig";

describe("TTS preferences", () => {
  beforeEach(() => localStorage.clear());

  it("uses independent Heart/Bella defaults and persists both choices", () => {
    expect(readTtsPreferences()).toEqual(DEFAULT_TTS_PREFERENCES);

    writeTtsPreferences({ examVoice: "af_sky", scriptVoice: "af_sarah" });

    expect(readTtsPreferences()).toEqual({
      examVoice: "af_sky",
      scriptVoice: "af_sarah",
    });
    expect(JSON.parse(localStorage.getItem(TTS_PREFERENCES_STORAGE_KEY) ?? "{}")).toEqual({
      examVoice: "af_sky",
      scriptVoice: "af_sarah",
    });
  });

  it("guards malformed JSON and invalid legacy voices per field", () => {
    localStorage.setItem(TTS_PREFERENCES_STORAGE_KEY, "not-json");
    expect(readTtsPreferences()).toEqual(DEFAULT_TTS_PREFERENCES);

    localStorage.setItem(
      TTS_PREFERENCES_STORAGE_KEY,
      JSON.stringify({ examVoice: "af_unknown", scriptVoice: "af_sky" }),
    );
    expect(readTtsPreferences()).toEqual({ examVoice: "af_heart", scriptVoice: "af_sky" });

    writeTtsPreferences({
      examVoice: "legacy_voice",
      scriptVoice: "also_legacy",
    } as unknown as TtsPreferences);
    expect(readTtsPreferences()).toEqual(DEFAULT_TTS_PREFERENCES);
  });
});

describe("STEP 4 script rate preferences", () => {
  beforeEach(() => localStorage.clear());

  it("uses the source-owned Level defaults and stores manual rates independently", () => {
    expect(DEFAULT_SCRIPT_RATE_BY_LEVEL).toEqual({
      advanced: 1,
      intermediate: 0.95,
      foundation: 0.9,
    });
    expect(readScriptRate("advanced")).toBe(1);
    expect(readScriptRate("intermediate")).toBe(0.95);
    expect(readScriptRate("foundation")).toBe(0.9);

    writeScriptRate("advanced", 1.05);
    writeScriptRate("foundation", 0.85);

    expect(readScriptRate("advanced")).toBe(1.05);
    expect(readScriptRate("intermediate")).toBe(0.95);
    expect(readScriptRate("foundation")).toBe(0.85);
    expect(JSON.parse(localStorage.getItem(SCRIPT_RATE_PREFERENCES_STORAGE_KEY) ?? "{}")).toEqual({
      advanced: 1.05,
      foundation: 0.85,
    });
  });

  it("falls back for malformed, off-step, and out-of-range stored values", () => {
    localStorage.setItem(SCRIPT_RATE_PREFERENCES_STORAGE_KEY, "not-json");
    expect(readScriptRatePreferences()).toEqual({});

    localStorage.setItem(
      SCRIPT_RATE_PREFERENCES_STORAGE_KEY,
      JSON.stringify({ advanced: 0.7, intermediate: 0.93, foundation: "0.9" }),
    );
    expect(readScriptRatePreferences()).toEqual({});
    expect(readScriptRate("advanced")).toBe(1);
    expect(readScriptRate("intermediate")).toBe(0.95);
    expect(readScriptRate("foundation")).toBe(0.9);
  });
});

describe("TTS cache identity and eviction", () => {
  it("varies by model version, voice, rate, and normalized text hash without embedding text", async () => {
    const base = { text: "Hello world", voice: "af_bella" as const, speed: 0.95 };
    const [first, voice, rate, text, model] = await Promise.all([
      createTtsCacheIdentity(base),
      createTtsCacheIdentity({ ...base, voice: "af_sky" }),
      createTtsCacheIdentity({ ...base, speed: 1 }),
      createTtsCacheIdentity({ ...base, text: "Hello again" }),
      createTtsCacheIdentity(base, `${KOKORO_MODEL_VERSION}-next`),
    ]);

    expect(new Set([first.key, voice.key, rate.key, text.key, model.key])).toHaveLength(5);
    expect(first.key).not.toContain(base.text);
    expect(
      (await createTtsCacheIdentity({ ...base, text: "  Hello   world  " })).key,
    ).toBe(first.key);
  });

  it("evicts the least recently accessed records above the 24-entry bound", () => {
    const records = Array.from({ length: MAX_PERSISTENT_AUDIO_CACHE_ENTRIES + 2 }, (_, index) => ({
      key: `key-${index}`,
      createdAt: index,
      lastAccessedAt: index,
    }));

    expect(selectPersistentCacheKeysForEviction(records)).toEqual(["key-0", "key-1"]);
  });
});

describe("TtsManager", () => {
  it("returns Kokoro audio and memoizes the same text/voice/speed for the session", async () => {
    const blob = new Blob(["wav"], { type: "audio/wav" });
    const generate = vi.fn().mockResolvedValue({
      blob,
      mimeType: "audio/wav",
      engine: "kokoro",
      voice: "af_bella",
    });
    const persistentCache = createPersistentCache();
    const manager = new TtsManager({ generate } as TtsEngine, undefined, persistentCache);
    const input = { text: "Hello", voice: "af_bella" as const, speed: 1 };

    const first = await manager.preparePlayback(input);
    const second = await manager.preparePlayback(input);

    expect(first).toMatchObject({ kind: "audio", blob, cached: false, cacheHit: "miss" });
    expect(second).toMatchObject({ kind: "audio", blob, cached: true, cacheHit: "memory" });
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it("misses for a changed rate and reuses the old exact-rate entry when returning", async () => {
    const generate = vi.fn(async (input: { voice: "af_bella" }) => ({
      blob: new Blob([`wav-${generate.mock.calls.length}`], { type: "audio/wav" }),
      mimeType: "audio/wav",
      engine: "kokoro" as const,
      voice: input.voice,
    }));
    const manager = new TtsManager(
      { generate } as TtsEngine,
      undefined,
      createPersistentCache(),
    );
    const base = { text: "Rate-specific script", voice: "af_bella" as const };

    const original = await manager.preparePlayback({ ...base, speed: 0.95 });
    const changed = await manager.preparePlayback({ ...base, speed: 1 });
    const returned = await manager.preparePlayback({ ...base, speed: 0.95 });

    expect(original).toMatchObject({ kind: "audio", cacheHit: "miss" });
    expect(changed).toMatchObject({ kind: "audio", cacheHit: "miss" });
    expect(returned).toMatchObject({ kind: "audio", cacheHit: "memory" });
    expect(generate).toHaveBeenCalledTimes(2);
  });

  it("returns an IndexedDB hit without starting the Kokoro engine", async () => {
    const input = { text: "Persistent hello", voice: "af_sarah" as const, speed: 0.9 };
    const identity = await createTtsCacheIdentity(input);
    const blob = new Blob(["persistent"], { type: "audio/wav" });
    const record = createCacheRecord(identity, blob);
    const persistentCache = createPersistentCache({ get: vi.fn().mockResolvedValue(record) });
    const generate = vi.fn();
    const manager = new TtsManager({ generate } as unknown as TtsEngine, undefined, persistentCache);

    const source = await manager.preparePlayback(input);

    expect(source).toMatchObject({
      kind: "audio",
      blob,
      cached: true,
      cacheHit: "indexeddb",
    });
    expect(generate).not.toHaveBeenCalled();
  });

  it("reuses a generated Blob from a fresh manager instance after reload", async () => {
    let stored: PersistentAudioCacheRecord | null = null;
    const persistentCache = createPersistentCache({
      get: vi.fn(async () => stored),
      set: vi.fn(async (record: PersistentAudioCacheRecord) => {
        stored = record;
      }),
    });
    const input = { text: "Reload me", voice: "af_sky" as const, speed: 1.05 };
    const firstGenerate = vi.fn().mockResolvedValue({
      blob: new Blob(["first-load"], { type: "audio/wav" }),
      mimeType: "audio/wav",
      engine: "kokoro",
      voice: "af_sky",
    });
    const firstManager = new TtsManager(
      { generate: firstGenerate } as TtsEngine,
      undefined,
      persistentCache,
    );
    await firstManager.preparePlayback(input);

    const reloadGenerate = vi.fn();
    const reloadedManager = new TtsManager(
      { generate: reloadGenerate } as unknown as TtsEngine,
      undefined,
      persistentCache,
    );
    const source = await reloadedManager.preparePlayback(input);

    expect(source).toMatchObject({ kind: "audio", cacheHit: "indexeddb", cached: true });
    expect(reloadGenerate).not.toHaveBeenCalled();
  });

  it("coalesces duplicate requests while one exact generation is in flight", async () => {
    let resolveGeneration: ((audio: {
      blob: Blob;
      mimeType: string;
      engine: "kokoro";
      voice: "af_bella";
    }) => void) | undefined;
    const generate = vi.fn(
      () =>
        new Promise<{
          blob: Blob;
          mimeType: string;
          engine: "kokoro";
          voice: "af_bella";
        }>((resolve) => {
          resolveGeneration = resolve;
        }),
    );
    const manager = new TtsManager(
      { generate } as TtsEngine,
      undefined,
      createPersistentCache(),
    );
    const input = { text: "Same request", voice: "af_bella" as const, speed: 1 };

    const first = manager.preparePlayback(input);
    const second = manager.preparePlayback(input);
    await vi.waitFor(() => expect(generate).toHaveBeenCalledTimes(1));
    resolveGeneration?.({
      blob: new Blob(["shared"], { type: "audio/wav" }),
      mimeType: "audio/wav",
      engine: "kokoro",
      voice: "af_bella",
    });

    const [firstSource, secondSource] = await Promise.all([first, second]);
    expect(firstSource).toBe(secondSource);
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it("continues with Kokoro when IndexedDB reads and writes fail", async () => {
    const blob = new Blob(["wav"], { type: "audio/wav" });
    const generate = vi.fn().mockResolvedValue({
      blob,
      mimeType: "audio/wav",
      engine: "kokoro",
      voice: "af_bella",
    });
    const persistentCache = createPersistentCache({
      get: vi.fn().mockRejectedValue(new Error("private mode")),
      set: vi.fn().mockRejectedValue(new Error("quota")),
    });
    const manager = new TtsManager({ generate } as TtsEngine, undefined, persistentCache);

    await expect(
      manager.preparePlayback({ text: "Still works", voice: "af_bella", speed: 1 }),
    ).resolves.toMatchObject({ kind: "audio", blob, cacheHit: "miss" });
    expect(generate).toHaveBeenCalledOnce();
  });

  it("preserves Web Speech as the fallback when Kokoro fails", async () => {
    const engine = {
      generate: vi.fn().mockRejectedValue(new Error("model load failed")),
    } as TtsEngine;
    const fallbackSpeak = vi.fn(() => ({}) as SpeechSynthesisUtterance);
    const manager = new TtsManager(engine, fallbackSpeak, createPersistentCache());
    const statuses: string[] = [];

    const source = await manager.preparePlayback(
      { text: "Fallback text", voice: "af_heart", speed: 0.95 },
      (status) => statuses.push(status.phase),
    );

    expect(source).toMatchObject({
      kind: "web-speech",
      fallback: true,
      voice: "af_heart",
    });
    expect(statuses).toContain("fallback");

    if (source.kind === "web-speech") source.play();
    expect(fallbackSpeak).toHaveBeenCalledWith("Fallback text", 0.95, undefined);
  });
});

function createPersistentCache(
  overrides: Partial<PersistentAudioCache> = {},
): PersistentAudioCache {
  return {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createCacheRecord(
  identity: Awaited<ReturnType<typeof createTtsCacheIdentity>>,
  blob: Blob,
): PersistentAudioCacheRecord {
  return {
    ...identity,
    blob,
    createdAt: 1,
    lastAccessedAt: 1,
    byteSize: blob.size,
  };
}

describe("KokoroBrowserEngine", () => {
  it("creates its Worker lazily and runs generation requests sequentially", async () => {
    const worker = new FakeWorker();
    const factory = vi.fn(() => worker as unknown as Worker);
    const engine = new KokoroBrowserEngine(factory);
    const firstStatuses: TtsRuntimeStatus[] = [];

    expect(factory).not.toHaveBeenCalled();
    const first = engine.generate(
      { text: "First", voice: "af_heart", speed: 1 },
      (status) => firstStatuses.push(status),
    );
    const second = engine.generate({ text: "Second", voice: "af_bella", speed: 1 });

    await Promise.resolve();
    await Promise.resolve();
    expect(factory).toHaveBeenCalledTimes(1);
    expect(worker.messages).toHaveLength(1);

    const firstRequest = worker.messages[0] as { requestId: string };
    worker.emitMessage({ type: "model-ready", requestId: firstRequest.requestId });
    worker.emitMessage({
      type: "generation-progress",
      requestId: firstRequest.requestId,
      progress: 50,
      completedChunks: 2,
      totalChunks: 4,
    });
    worker.emitMessage({
      type: "generated",
      requestId: firstRequest.requestId,
      blob: new Blob(["first"], { type: "audio/wav" }),
    });
    await first;
    await Promise.resolve();

    expect(worker.messages).toHaveLength(2);
    const secondRequest = worker.messages[1] as { requestId: string };
    worker.emitMessage({ type: "model-ready", requestId: secondRequest.requestId });
    worker.emitMessage({
      type: "generated",
      requestId: secondRequest.requestId,
      blob: new Blob(["second"], { type: "audio/wav" }),
    });
    await second;

    expect(firstStatuses.map((status) => status.phase)).toEqual(
      expect.arrayContaining(["loading-model", "generating", "ready"]),
    );
    expect(firstStatuses).toContainEqual({
      phase: "generating",
      progress: 50,
      completedChunks: 2,
      totalChunks: 4,
    });
    engine.dispose();
    expect(worker.terminate).toHaveBeenCalledOnce();
  });
});

class FakeWorker {
  readonly messages: unknown[] = [];
  readonly terminate = vi.fn();
  private readonly listeners = new Map<string, Set<EventListener>>();

  addEventListener(type: string, listener: EventListener) {
    const current = this.listeners.get(type) ?? new Set<EventListener>();
    current.add(listener);
    this.listeners.set(type, current);
  }

  removeEventListener(type: string, listener: EventListener) {
    this.listeners.get(type)?.delete(listener);
  }

  postMessage(message: unknown) {
    this.messages.push(message);
  }

  emitMessage(data: unknown) {
    this.listeners
      .get("message")
      ?.forEach((listener) => listener({ data } as MessageEvent));
  }
}
