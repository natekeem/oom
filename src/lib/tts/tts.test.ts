import { beforeEach, describe, expect, it, vi } from "vitest";
import { KokoroBrowserEngine } from "./KokoroBrowserEngine";
import { TtsManager } from "./TtsManager";
import {
  readTtsPreferences,
  TTS_PREFERENCES_STORAGE_KEY,
  writeTtsPreferences,
} from "./preferences";
import type { TtsEngine, TtsPreferences } from "./types";
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

describe("TtsManager", () => {
  it("returns Kokoro audio and memoizes the same text/voice/speed for the session", async () => {
    const blob = new Blob(["wav"], { type: "audio/wav" });
    const generate = vi.fn().mockResolvedValue({
      blob,
      mimeType: "audio/wav",
      engine: "kokoro",
      voice: "af_bella",
    });
    const manager = new TtsManager({ generate } as TtsEngine);
    const input = { text: "Hello", voice: "af_bella" as const, speed: 1 };

    const first = await manager.preparePlayback(input);
    const second = await manager.preparePlayback(input);

    expect(first).toMatchObject({ kind: "audio", blob, cached: false });
    expect(second).toMatchObject({ kind: "audio", blob, cached: true });
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it("preserves Web Speech as the fallback when Kokoro fails", async () => {
    const engine = {
      generate: vi.fn().mockRejectedValue(new Error("model load failed")),
    } as TtsEngine;
    const fallbackSpeak = vi.fn(() => ({}) as SpeechSynthesisUtterance);
    const manager = new TtsManager(engine, fallbackSpeak);
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

describe("KokoroBrowserEngine", () => {
  it("creates its Worker lazily and runs generation requests sequentially", async () => {
    const worker = new FakeWorker();
    const factory = vi.fn(() => worker as unknown as Worker);
    const engine = new KokoroBrowserEngine(factory);
    const firstStatuses: string[] = [];

    expect(factory).not.toHaveBeenCalled();
    const first = engine.generate(
      { text: "First", voice: "af_heart", speed: 1 },
      (status) => firstStatuses.push(status.phase),
    );
    const second = engine.generate({ text: "Second", voice: "af_bella", speed: 1 });

    await Promise.resolve();
    await Promise.resolve();
    expect(factory).toHaveBeenCalledTimes(1);
    expect(worker.messages).toHaveLength(1);

    const firstRequest = worker.messages[0] as { requestId: string };
    worker.emitMessage({ type: "model-ready", requestId: firstRequest.requestId });
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

    expect(firstStatuses).toEqual(
      expect.arrayContaining(["loading-model", "generating", "ready"]),
    );
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
