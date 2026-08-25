import { beforeEach, describe, expect, it, vi } from "vitest";
import { normalizeTtsText, sha256TtsText } from "./cacheKey";
import { ManifestStaticTtsResolver, supportsStaticTtsAudio } from "./staticTts";

const peaks = Array.from({ length: 256 }, (_, index) => (index + 1) / 256);

beforeEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.spyOn(HTMLMediaElement.prototype, "canPlayType").mockReturnValue("probably");
});

describe("ManifestStaticTtsResolver", () => {
  it("resolves a production-complete manifest to a base-safe direct URL and real peaks", async () => {
    const text = "  Cafe\u0301\r\n story ";
    const hash = await sha256TtsText(normalizeTtsText(text));
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    const manifest = completeManifest(hash!);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => manifest })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          version: 1,
          method: "pcm16-window-max-global-normalized",
          duration: 5.25,
          peaks,
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const source = await new ManifestStaticTtsResolver().resolve({
      text,
      voice: "af_heart",
      speed: 0.9,
    });

    expect(source).toMatchObject({
      kind: "static",
      url: `/generated-tts/audio/${hash}/heart.webm`,
      peaks,
      duration: 5.25,
      bytes: 42000,
      voice: "af_heart",
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/generated-tts/tts-manifest.json",
      { cache: "no-cache" },
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `/generated-tts/audio/${hash}/heart.peaks.json`,
      { cache: "force-cache" },
    );
  });

  it("fails closed for unsupported codecs and never fetches assets", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "canPlayType").mockReturnValue("");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    expect(supportsStaticTtsAudio()).toBe(false);
    await expect(
      new ManifestStaticTtsResolver().resolve({ text: "Hello", voice: "af_bella" }),
    ).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a partial staging-shaped manifest", async () => {
    const hash = await sha256TtsText("Hello");
    const manifest = completeManifest(hash!);
    manifest.coverage.complete = false;
    manifest.coverage.completedVoiceAssets = 12;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => manifest }));

    await expect(
      new ManifestStaticTtsResolver().resolve({ text: "Hello", voice: "af_heart" }),
    ).resolves.toBeNull();
  });

  it("revalidates after a stale manifest instead of permanently falling back to runtime TTS", async () => {
    const hash = await sha256TtsText("Hello");
    const staleManifest = completeManifest(hash!);
    staleManifest.coverage.expectedTexts = 146;
    staleManifest.coverage.completedTexts = 146;
    staleManifest.coverage.expectedVoiceAssets = 584;
    staleManifest.coverage.completedVoiceAssets = 584;
    const currentManifest = completeManifest(hash!);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => staleManifest })
      .mockResolvedValueOnce({ ok: true, json: async () => currentManifest })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          version: 1,
          method: "pcm16-window-max-global-normalized",
          duration: 5.25,
          peaks,
        }),
      });
    vi.stubGlobal("fetch", fetchMock);
    const resolver = new ManifestStaticTtsResolver();

    await expect(
      resolver.resolve({ text: "Hello", voice: "af_heart" }),
    ).resolves.toBeNull();
    await expect(
      resolver.resolve({ text: "Hello", voice: "af_heart" }),
    ).resolves.toMatchObject({ kind: "static", voice: "af_heart" });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/generated-tts/tts-manifest.json",
      { cache: "no-cache" },
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/generated-tts/tts-manifest.json",
      { cache: "no-cache" },
    );
  });
});

function completeManifest(hash: string) {
  return {
    version: 1,
    synthesisProfile: "kokoro-82m-natural-1.0-v1",
    synthesisRate: 1,
    normalization: "unicode-nfc-trim-whitespace-v1",
    audioFormat: {
      container: "webm",
      codec: "opus",
      mimeType: "audio/webm; codecs=opus",
      channels: 1,
    },
    waveform: { count: 256 },
    voices: ["af_heart", "af_bella", "af_sarah", "af_sky"],
    coverage: {
      expectedTexts: 173,
      expectedVoiceAssets: 692,
      completedTexts: 173,
      completedVoiceAssets: 692,
      complete: true,
    },
    entries: Object.fromEntries(
      Array.from({ length: 173 }, (_, index) => {
        const entryHash = index === 0 ? hash : `${index}`.padStart(64, "0");
        return [entryHash, {
        audio: {
          af_heart: {
            url: `audio/${entryHash}/heart.webm`,
            peaksUrl: `audio/${entryHash}/heart.peaks.json`,
            duration: 5.25,
            bytes: 42000,
            mimeType: "audio/webm; codecs=opus",
          },
          af_bella: { url: "bella.webm", peaksUrl: "bella.json", duration: 5, bytes: 1, mimeType: "audio/webm; codecs=opus" },
          af_sarah: { url: "sarah.webm", peaksUrl: "sarah.json", duration: 5, bytes: 1, mimeType: "audio/webm; codecs=opus" },
          af_sky: { url: "sky.webm", peaksUrl: "sky.json", duration: 5, bytes: 1, mimeType: "audio/webm; codecs=opus" },
        },
      }];
      }),
    ),
  };
}
