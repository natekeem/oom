import { normalizeTtsText, sha256TtsText } from "./cacheKey";
import { OOM_VOICE_IDS, type OomVoiceId, type TtsGenerateInput, type TtsPlaybackSource } from "./types";

const STATIC_TTS_ROOT = "generated-tts";
const STATIC_TTS_MANIFEST = "tts-manifest.json";
const STATIC_TTS_PROFILE = "kokoro-82m-natural-1.0-v1";
const STATIC_TTS_NORMALIZATION = "unicode-nfc-trim-whitespace-v1";
const STATIC_TTS_EXPECTED_TEXTS = 173;
const STATIC_TTS_EXPECTED_ASSETS = 692;
const STATIC_TTS_PEAK_COUNT = 256;
const STATIC_TTS_MIME_TYPE = "audio/webm; codecs=opus" as const;
const STATIC_TTS_CAPABILITY_MIME_TYPE = 'audio/webm; codecs="opus"';

type StaticAudioEntry = {
  url: string;
  peaksUrl: string;
  duration: number;
  bytes: number;
  mimeType: string;
};

type StaticManifest = {
  version: number;
  synthesisProfile: string;
  synthesisRate: number;
  normalization: string;
  audioFormat: { container: string; codec: string; mimeType: string; channels: number };
  waveform: { count: number };
  voices: OomVoiceId[];
  coverage: {
    expectedTexts: number;
    expectedVoiceAssets: number;
    completedTexts: number;
    completedVoiceAssets: number;
    complete: boolean;
  };
  entries: Record<string, { audio: Partial<Record<OomVoiceId, StaticAudioEntry>> }>;
};

export type StaticTtsResolver = {
  resolve(input: TtsGenerateInput): Promise<Extract<TtsPlaybackSource, { kind: "static" }> | null>;
};

function baseUrl(path: string) {
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}${path.replace(/^\/+/, "")}`;
}

export function supportsStaticTtsAudio() {
  if (typeof document === "undefined") return false;
  const audio = document.createElement("audio");
  return audio.canPlayType(STATIC_TTS_CAPABILITY_MIME_TYPE) !== "";
}

function isCompleteManifest(value: unknown): value is StaticManifest {
  if (!value || typeof value !== "object") return false;
  const manifest = value as StaticManifest;
  const entries = Object.values(manifest.entries ?? {});
  const hasExactAssets =
    entries.length === STATIC_TTS_EXPECTED_TEXTS &&
    entries.every((entry) =>
      OOM_VOICE_IDS.every((voice) => Boolean(entry?.audio?.[voice])),
    );
  return (
    manifest.version === 1 &&
    manifest.synthesisProfile === STATIC_TTS_PROFILE &&
    manifest.synthesisRate === 1 &&
    manifest.normalization === STATIC_TTS_NORMALIZATION &&
    manifest.audioFormat?.container === "webm" &&
    manifest.audioFormat?.codec === "opus" &&
    manifest.audioFormat?.mimeType === STATIC_TTS_MIME_TYPE &&
    manifest.audioFormat?.channels === 1 &&
    manifest.waveform?.count === STATIC_TTS_PEAK_COUNT &&
    Array.isArray(manifest.voices) &&
    OOM_VOICE_IDS.every((voice) => manifest.voices.includes(voice)) &&
    manifest.coverage?.complete === true &&
    manifest.coverage.expectedTexts === STATIC_TTS_EXPECTED_TEXTS &&
    manifest.coverage.completedTexts === STATIC_TTS_EXPECTED_TEXTS &&
    manifest.coverage.expectedVoiceAssets === STATIC_TTS_EXPECTED_ASSETS &&
    manifest.coverage.completedVoiceAssets === STATIC_TTS_EXPECTED_ASSETS &&
    hasExactAssets
  );
}

function isValidPeaks(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length === STATIC_TTS_PEAK_COUNT &&
    value.some((peak) => typeof peak === "number" && peak > 0) &&
    value.every((peak) => typeof peak === "number" && Number.isFinite(peak) && peak >= 0 && peak <= 1)
  );
}

export class ManifestStaticTtsResolver implements StaticTtsResolver {
  private manifestPromise: Promise<StaticManifest | null> | null = null;
  private readonly peaksPromises = new Map<string, Promise<number[] | null>>();

  private loadManifest() {
    if (!this.manifestPromise) {
      const pending = fetch(baseUrl(`${STATIC_TTS_ROOT}/${STATIC_TTS_MANIFEST}`), {
        cache: "no-cache",
      })
        .then(async (response) => {
          if (!response.ok) return null;
          const manifest: unknown = await response.json();
          return isCompleteManifest(manifest) ? manifest : null;
        })
        .catch(() => null);
      this.manifestPromise = pending;
      void pending.then((manifest) => {
        if (!manifest && this.manifestPromise === pending) {
          this.manifestPromise = null;
        }
      });
    }
    return this.manifestPromise;
  }

  private loadPeaks(path: string, expectedDuration: number) {
    const url = baseUrl(`${STATIC_TTS_ROOT}/${path}`);
    let promise = this.peaksPromises.get(url);
    if (!promise) {
      const pending = fetch(url, { cache: "force-cache" })
        .then(async (response) => {
          if (!response.ok) return null;
          const value: unknown = await response.json();
          if (!value || typeof value !== "object") return null;
          const metadata = value as {
            version?: unknown;
            method?: unknown;
            duration?: unknown;
            peaks?: unknown;
          };
          return metadata.version === 1 &&
            metadata.method === "pcm16-window-max-global-normalized" &&
            typeof metadata.duration === "number" &&
            Math.abs(metadata.duration - expectedDuration) <= 0.15 &&
            isValidPeaks(metadata.peaks)
            ? metadata.peaks
            : null;
        })
        .catch(() => null);
      promise = pending;
      this.peaksPromises.set(url, pending);
      void pending.then((peaks) => {
        if (!peaks && this.peaksPromises.get(url) === pending) {
          this.peaksPromises.delete(url);
        }
      });
    }
    return promise;
  }

  async resolve(input: TtsGenerateInput) {
    if (!supportsStaticTtsAudio()) return null;
    const hash = await sha256TtsText(normalizeTtsText(input.text));
    if (!hash) return null;
    const manifest = await this.loadManifest();
    const audio = manifest?.entries[hash]?.audio[input.voice];
    if (
      !audio ||
      audio.mimeType !== STATIC_TTS_MIME_TYPE ||
      !Number.isFinite(audio.duration) ||
      audio.duration <= 0 ||
      !Number.isInteger(audio.bytes) ||
      audio.bytes <= 0
    ) {
      return null;
    }
    const peaks = await this.loadPeaks(audio.peaksUrl, audio.duration);
    if (!peaks) return null;
    return {
      kind: "static" as const,
      url: baseUrl(`${STATIC_TTS_ROOT}/${audio.url}`),
      peaks,
      duration: audio.duration,
      bytes: audio.bytes,
      mimeType: STATIC_TTS_MIME_TYPE,
      voice: input.voice,
      engine: "static" as const,
    };
  }
}

let defaultStaticResolver: StaticTtsResolver | null = null;

export function getStaticTtsResolver() {
  if (!defaultStaticResolver) defaultStaticResolver = new ManifestStaticTtsResolver();
  return defaultStaticResolver;
}

export function resetStaticTtsResolverForTests() {
  defaultStaticResolver = null;
}
