import { beforeEach, describe, expect, it, vi } from "vitest";
import { KokoroBrowserEngine } from "./KokoroBrowserEngine";
import { TtsManager } from "./TtsManager";
import { createTtsCacheIdentity, normalizeTtsText } from "./cacheKey";
import {
  KOKORO_DEVICE,
  KOKORO_DTYPE,
  KOKORO_MODEL_VERSION,
  KOKORO_SYNTHESIS_PROFILE,
  KOKORO_SYNTHESIS_RATE,
} from "./kokoroConfig";
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
  it("varies by model, profile, voice, and text but ignores playback rate", async () => {
    const base = { text: "Hello world", voice: "af_bella" as const, speed: 0.95 };
    const [first, voice, rate, text, model, profile] = await Promise.all([
      createTtsCacheIdentity(base),
      createTtsCacheIdentity({ ...base, voice: "af_sky" }),
      createTtsCacheIdentity({ ...base, speed: 1 }),
      createTtsCacheIdentity({ ...base, text: "Hello again" }),
      createTtsCacheIdentity(base, `${KOKORO_MODEL_VERSION}-next`),
      createTtsCacheIdentity(
        base,
        KOKORO_MODEL_VERSION,
        `${KOKORO_SYNTHESIS_PROFILE}-next`,
      ),
    ]);

    expect(rate.key).toBe(first.key);
    expect(new Set([first.key, voice.key, text.key, model.key, profile.key])).toHaveLength(5);
    expect(first.key).not.toContain(base.text);
    expect(first.key).toContain(KOKORO_SYNTHESIS_PROFILE);
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

  it("normalizes Unicode, line endings, and whitespace exactly once", () => {
    expect(normalizeTtsText("  Cafe\u0301\r\n\t story  ")).toBe("Café story");
  });
});

describe("TtsManager", () => {
  it("returns a static hit before touching IndexedDB or the Kokoro engine", async () => {
    const staticSource = {
      kind: "static" as const,
      url: "/generated-tts/audio/hash/heart.webm",
      peaks: Array.from({ length: 256 }, () => 0.5),
      duration: 4.2,
      bytes: 12345,
      mimeType: "audio/webm; codecs=opus" as const,
      voice: "af_heart" as const,
      engine: "static" as const,
    };
    const generate = vi.fn();
    const persistentCache = createPersistentCache();
    const staticResolver = { resolve: vi.fn().mockResolvedValue(staticSource) };
    const manager = new TtsManager(
      { generate } as unknown as TtsEngine,
      undefined,
      persistentCache,
      staticResolver,
    );

    await expect(
      manager.preparePlayback({ text: "Static", voice: "af_heart", speed: 0.85 }),
    ).resolves.toBe(staticSource);
    expect(staticResolver.resolve).toHaveBeenCalledWith(
      expect.objectContaining({ speed: KOKORO_SYNTHESIS_RATE }),
    );
    expect(persistentCache.get).not.toHaveBeenCalled();
    expect(persistentCache.set).not.toHaveBeenCalled();
    expect(generate).not.toHaveBeenCalled();
  });

  it("can bypass one failed static URL and continue through the runtime chain", async () => {
    const blob = new Blob(["runtime"], { type: "audio/wav" });
    const generate = vi.fn().mockResolvedValue({
      blob,
      mimeType: "audio/wav",
      engine: "kokoro",
      voice: "af_heart",
    });
    const staticResolver = { resolve: vi.fn() };
    const manager = new TtsManager(
      { generate } as TtsEngine,
      undefined,
      createPersistentCache(),
      staticResolver,
    );

    await expect(
      manager.preparePlayback(
        { text: "Static failed", voice: "af_heart", speed: 1 },
        undefined,
        { skipStatic: true },
      ),
    ).resolves.toMatchObject({ kind: "audio", blob, cacheHit: "miss" });
    expect(staticResolver.resolve).not.toHaveBeenCalled();
    expect(generate).toHaveBeenCalledOnce();
  });

  it("returns Kokoro audio and memoizes the same text/voice across playback rates", async () => {
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
    const second = await manager.preparePlayback({ ...input, speed: 0.85 });

    expect(first).toMatchObject({ kind: "audio", blob, cached: false, cacheHit: "miss" });
    expect(second).toMatchObject({ kind: "audio", blob, cached: true, cacheHit: "memory" });
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it("does not regenerate or miss cache solely because playback rate changes", async () => {
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

    expect(original).toMatchObject({ kind: "audio", cacheHit: "miss" });
    expect(changed).toMatchObject({ kind: "audio", cacheHit: "memory" });
    expect(generate).toHaveBeenCalledTimes(1);
    expect(generate).toHaveBeenCalledWith(
      expect.objectContaining({ speed: KOKORO_SYNTHESIS_RATE }),
      expect.any(Function),
    );
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

  it("ignores a legacy rate-keyed record that lacks the current synthesis profile", async () => {
    const input = { text: "Legacy cache", voice: "af_bella" as const, speed: 1 };
    const identity = await createTtsCacheIdentity(input);
    const legacyRecord: PersistentAudioCacheRecord = {
      ...createCacheRecord(identity, new Blob(["legacy"], { type: "audio/wav" })),
      synthesisProfile: undefined,
      rate: 1,
    };
    const freshBlob = new Blob(["fresh"], { type: "audio/wav" });
    const generate = vi.fn().mockResolvedValue({
      blob: freshBlob,
      mimeType: "audio/wav",
      engine: "kokoro",
      voice: "af_bella",
    });
    const manager = new TtsManager(
      { generate } as TtsEngine,
      undefined,
      createPersistentCache({ get: vi.fn().mockResolvedValue(legacyRecord) }),
    );

    await expect(manager.preparePlayback(input)).resolves.toMatchObject({
      kind: "audio",
      blob: freshBlob,
      cacheHit: "miss",
    });
    expect(generate).toHaveBeenCalledOnce();
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
    expect(fallbackSpeak).toHaveBeenCalledWith(
      "Fallback text",
      KOKORO_SYNTHESIS_RATE,
      undefined,
    );
  });
});

describe("production Kokoro profile", () => {
  it("keeps q8 WASM with fixed natural 1.00 synthesis", () => {
    expect(KOKORO_DTYPE).toBe("q8");
    expect(KOKORO_DEVICE).toBe("wasm");
    expect(KOKORO_SYNTHESIS_RATE).toBe(1);
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
      { text: "First", voice: "af_heart", speed: 0.85 },
      (status) => firstStatuses.push(status),
    );
    const second = engine.generate({ text: "Second", voice: "af_bella", speed: 1 });

    await Promise.resolve();
    await Promise.resolve();
    expect(factory).toHaveBeenCalledTimes(1);
    expect(worker.messages).toHaveLength(1);

    const firstRequest = worker.messages[0] as { requestId: string };
    expect(firstRequest).not.toHaveProperty("speed");
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
