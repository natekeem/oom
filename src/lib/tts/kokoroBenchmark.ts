import { KokoroTTS, TextSplitterStream } from "kokoro-js";
import { resolveTrainingContext } from "../../training/courseRegistry";
import {
  KOKORO_DEVICE,
  KOKORO_DTYPE,
  KOKORO_MODEL_ID,
  KOKORO_SYNTHESIS_RATE,
} from "./kokoroConfig";
import { splitTtsText } from "./pcmWav";

type BenchmarkStatus = "completed" | "unsupported" | "failed";

export type TtsBenchmarkMode =
  | "q8 WASM current"
  | "q8 WASM streaming"
  | "fp32 WebGPU";

export type TtsBenchmarkEnvironment = {
  browser: string;
  os: string;
  webgpuAvailable: boolean;
  gpuAdapterDescription?: string;
  hardwareConcurrency: number;
};

export type TtsBenchmarkResult = {
  mode: TtsBenchmarkMode;
  status: BenchmarkStatus;
  modelLoadMs: number | null;
  firstChunkMs: number | null;
  firstAudioMs: number | null;
  totalGenerationMs: number | null;
  audioDurationSeconds: number | null;
  generationAudioRatio: number | null;
  chunkCount: number | null;
  underrunCount: number | null;
  maxChunkGapMs: number | null;
  totalChunkGapMs: number | null;
  notes: string;
};

export type TtsBenchmarkReport = {
  inputChars: number;
  voice: "af_bella";
  synthesisRate: 1;
  productionDefault: {
    dtype: typeof KOKORO_DTYPE;
    device: typeof KOKORO_DEVICE;
  };
  environment: TtsBenchmarkEnvironment;
  results: TtsBenchmarkResult[];
};

type BenchmarkProgress = (message: string) => void;

type GpuAdapterInfo = {
  architecture?: string;
  description?: string;
  vendor?: string;
};

type GpuAdapter = {
  info?: GpuAdapterInfo;
  requestAdapterInfo?: () => Promise<GpuAdapterInfo>;
};

type NavigatorWithGpu = Navigator & {
  gpu?: {
    requestAdapter: () => Promise<GpuAdapter | null>;
  };
};

function elapsedSince(startedAt: number) {
  return performance.now() - startedAt;
}

function round(value: number, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function completedResult(
  result: Omit<TtsBenchmarkResult, "status" | "generationAudioRatio">,
): TtsBenchmarkResult {
  const ratio =
    result.totalGenerationMs !== null &&
    result.audioDurationSeconds !== null &&
    result.audioDurationSeconds > 0
      ? result.totalGenerationMs / 1000 / result.audioDurationSeconds
      : null;

  return {
    ...result,
    status: "completed",
    generationAudioRatio: ratio === null ? null : round(ratio, 2),
  };
}

function unavailableResult(
  mode: TtsBenchmarkMode,
  status: Exclude<BenchmarkStatus, "completed">,
  notes: string,
  modelLoadMs: number | null = null,
): TtsBenchmarkResult {
  return {
    mode,
    status,
    modelLoadMs,
    firstChunkMs: null,
    firstAudioMs: null,
    totalGenerationMs: null,
    audioDurationSeconds: null,
    generationAudioRatio: null,
    chunkCount: null,
    underrunCount: null,
    maxChunkGapMs: null,
    totalChunkGapMs: null,
    notes,
  };
}

function describeBrowser(userAgent: string) {
  const edge = userAgent.match(/Edg\/([\d.]+)/);
  if (edge) return `Edge ${edge[1]}`;
  const chrome = userAgent.match(/(?:Chrome|Chromium)\/([\d.]+)/);
  if (chrome) return `Chrome ${chrome[1]}`;
  const firefox = userAgent.match(/Firefox\/([\d.]+)/);
  if (firefox) return `Firefox ${firefox[1]}`;
  const safari = userAgent.match(/Version\/([\d.]+).*Safari/);
  if (safari) return `Safari ${safari[1]}`;
  return userAgent;
}

function describeOs(userAgent: string, platform: string) {
  if (/Windows/i.test(userAgent)) return "Windows";
  if (/Android/i.test(userAgent)) return "Android";
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS/iPadOS";
  if (/Mac OS X|Macintosh/i.test(userAgent)) return "macOS";
  if (/Linux/i.test(userAgent)) return "Linux";
  return platform || "Unknown";
}

async function readBenchmarkEnvironment() {
  const benchmarkNavigator = navigator as NavigatorWithGpu;
  const adapter: GpuAdapter | null = await (async () => {
    try {
      return (await benchmarkNavigator.gpu?.requestAdapter()) ?? null;
    } catch {
      return null;
    }
  })();

  let adapterInfo = adapter?.info;
  if (!adapterInfo && adapter?.requestAdapterInfo) {
    try {
      adapterInfo = await adapter.requestAdapterInfo();
    } catch {
      adapterInfo = undefined;
    }
  }

  const gpuAdapterDescription = [
    adapterInfo?.description,
    adapterInfo?.architecture,
    adapterInfo?.vendor,
  ]
    .filter((value, index, values): value is string =>
      Boolean(value && values.indexOf(value) === index),
    )
    .join(" · ");

  return {
    browser: describeBrowser(navigator.userAgent),
    os: describeOs(navigator.userAgent, navigator.platform),
    webgpuAvailable: Boolean(adapter),
    gpuAdapterDescription: gpuAdapterDescription || undefined,
    hardwareConcurrency: navigator.hardwareConcurrency || 1,
  } satisfies TtsBenchmarkEnvironment;
}

async function loadModel(
  dtype: "q8" | "fp32",
  device: "wasm" | "webgpu",
  progress: BenchmarkProgress,
) {
  const startedAt = performance.now();
  const tts = await KokoroTTS.from_pretrained(KOKORO_MODEL_ID, {
    dtype,
    device,
    progress_callback: (payload) => {
      if (typeof payload.progress === "number") {
        progress(`${dtype} ${device} 모델 로드 · ${Math.round(payload.progress)}%`);
      }
    },
  });
  return { tts, modelLoadMs: elapsedSince(startedAt) };
}

async function disposeModel(tts: KokoroTTS) {
  try {
    await tts.model?.dispose?.();
  } catch {
    // Benchmark cleanup must not hide completed measurements.
  }
}

async function runCurrentGeneration(
  mode: "q8 WASM current" | "fp32 WebGPU",
  tts: KokoroTTS,
  text: string,
  modelLoadMs: number,
): Promise<TtsBenchmarkResult> {
  const segments = splitTtsText(text);
  const startedAt = performance.now();
  let firstChunkMs: number | null = null;
  let audioDurationSeconds = 0;

  for (const segment of segments) {
    const audio = await tts.generate(segment, {
      voice: "af_bella",
      speed: KOKORO_SYNTHESIS_RATE,
    });
    if (firstChunkMs === null) firstChunkMs = elapsedSince(startedAt);
    audioDurationSeconds += audio.audio.length / audio.sampling_rate;
  }

  const totalGenerationMs = elapsedSince(startedAt);
  return completedResult({
    mode,
    modelLoadMs: round(modelLoadMs),
    firstChunkMs: firstChunkMs === null ? null : round(firstChunkMs),
    // The production/current path waits for the combined WAV before playback.
    firstAudioMs: round(modelLoadMs + totalGenerationMs),
    totalGenerationMs: round(totalGenerationMs),
    audioDurationSeconds: round(audioDurationSeconds, 1),
    chunkCount: segments.length,
    underrunCount: 0,
    maxChunkGapMs: 0,
    totalChunkGapMs: 0,
    notes: `첫 chunk ${round((firstChunkMs ?? 0) / 1000, 1)}초; 전체 WAV 완료 후 재생`,
  });
}

function scheduleAudioChunk(
  context: AudioContext,
  audio: Float32Array,
  sampleRate: number,
  scheduledAt: number,
) {
  const buffer = context.createBuffer(1, audio.length, sampleRate);
  buffer.getChannelData(0).set(audio);
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(scheduledAt);
}

async function runStreamingGeneration(
  tts: KokoroTTS,
  text: string,
  modelLoadMs: number,
  audioContext: AudioContext | null,
): Promise<TtsBenchmarkResult> {
  if (audioContext?.state === "suspended") await audioContext.resume();

  const splitter = new TextSplitterStream();
  splitter.push(text);
  splitter.close();

  const startedAt = performance.now();
  let firstChunkMs: number | null = null;
  let audioDurationSeconds = 0;
  let chunkCount = 0;
  let playbackEndMs: number | null = null;
  let scheduledAudioEnd = audioContext?.currentTime ?? null;
  const gaps: number[] = [];

  for await (const chunk of tts.stream(splitter, {
    voice: "af_bella",
    speed: KOKORO_SYNTHESIS_RATE,
  })) {
    const readyAtMs = elapsedSince(startedAt);
    const durationSeconds = chunk.audio.audio.length / chunk.audio.sampling_rate;
    if (firstChunkMs === null) firstChunkMs = readyAtMs;

    if (playbackEndMs !== null) {
      gaps.push(Math.max(0, readyAtMs - playbackEndMs));
      playbackEndMs = Math.max(playbackEndMs, readyAtMs) + durationSeconds * 1000;
    } else {
      playbackEndMs = readyAtMs + durationSeconds * 1000;
    }

    if (audioContext) {
      const earliestStart = audioContext.currentTime + 0.05;
      const startAt =
        scheduledAudioEnd === null ? earliestStart : Math.max(earliestStart, scheduledAudioEnd);
      scheduleAudioChunk(
        audioContext,
        chunk.audio.audio,
        chunk.audio.sampling_rate,
        startAt,
      );
      scheduledAudioEnd = startAt + durationSeconds;
    }

    audioDurationSeconds += durationSeconds;
    chunkCount += 1;
  }

  const totalGenerationMs = elapsedSince(startedAt);
  const maxChunkGapMs = gaps.length > 0 ? Math.max(...gaps) : 0;
  const totalChunkGapMs = gaps.reduce((total, gap) => total + gap, 0);
  const underrunCount = gaps.filter((gap) => gap > 100).length;

  if (audioContext && scheduledAudioEnd !== null) {
    const remainingMs = Math.max(0, (scheduledAudioEnd - audioContext.currentTime) * 1000);
    if (remainingMs > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, Math.min(remainingMs, 30_000)));
    }
  }

  return completedResult({
    mode: "q8 WASM streaming",
    modelLoadMs: round(modelLoadMs),
    firstChunkMs: firstChunkMs === null ? null : round(firstChunkMs),
    firstAudioMs:
      firstChunkMs === null ? null : round(modelLoadMs + firstChunkMs),
    totalGenerationMs: round(totalGenerationMs),
    audioDurationSeconds: round(audioDurationSeconds, 1),
    chunkCount,
    underrunCount,
    maxChunkGapMs: round(maxChunkGapMs),
    totalChunkGapMs: round(totalChunkGapMs),
    notes: `${audioContext ? "Web Audio로 즉시 재생" : "재생 timeline 계산만 수행"}; 100ms 초과 underrun ${underrunCount}회`,
  });
}

export function getDefaultTtsBenchmarkText() {
  return resolveTrainingContext("course-1", "advanced").storylines[0].active
    .englishScript;
}

export async function runKokoroBenchmark(
  text = getDefaultTtsBenchmarkText(),
  progress: BenchmarkProgress = () => undefined,
): Promise<TtsBenchmarkReport> {
  if (!import.meta.env.DEV) {
    throw new Error("Kokoro benchmark는 개발 서버에서만 실행할 수 있습니다.");
  }

  const normalizedText = text.trim();
  if (!normalizedText) throw new Error("Benchmark text가 비어 있습니다.");

  const AudioContextConstructor = window.AudioContext;
  const audioContext = AudioContextConstructor ? new AudioContextConstructor() : null;
  const audioContextReady = audioContext?.resume();
  const environment = await readBenchmarkEnvironment();
  const results: TtsBenchmarkResult[] = [];
  if (audioContextReady) await audioContextReady;

  let wasmTts: KokoroTTS | null = null;
  try {
    progress("q8 WASM 모델 로드 중");
    const loaded = await loadModel(KOKORO_DTYPE, KOKORO_DEVICE, progress);
    wasmTts = loaded.tts;

    progress("q8 WASM streaming 측정 중");
    results.push(
      await runStreamingGeneration(
        wasmTts,
        normalizedText,
        loaded.modelLoadMs,
        audioContext,
      ),
    );

    progress("q8 WASM current 측정 중");
    results.unshift(
      await runCurrentGeneration(
        "q8 WASM current",
        wasmTts,
        normalizedText,
        loaded.modelLoadMs,
      ),
    );
  } catch (error) {
    const notes = error instanceof Error ? error.message : String(error);
    results.push(unavailableResult("q8 WASM current", "failed", notes));
    results.push(unavailableResult("q8 WASM streaming", "failed", notes));
  } finally {
    if (wasmTts) await disposeModel(wasmTts);
  }

  if (!environment.webgpuAvailable) {
    results.push(
      unavailableResult(
        "fp32 WebGPU",
        "unsupported",
        "navigator.gpu adapter를 사용할 수 없음",
      ),
    );
  } else {
    let webgpuTts: KokoroTTS | null = null;
    const loadStartedAt = performance.now();
    try {
      progress("fp32 WebGPU 모델 로드 중");
      const loaded = await loadModel("fp32", "webgpu", progress);
      webgpuTts = loaded.tts;
      progress("fp32 WebGPU 측정 중");
      results.push(
        await runCurrentGeneration(
          "fp32 WebGPU",
          webgpuTts,
          normalizedText,
          loaded.modelLoadMs,
        ),
      );
    } catch (error) {
      results.push(
        unavailableResult(
          "fp32 WebGPU",
          "failed",
          error instanceof Error ? error.message : String(error),
          round(elapsedSince(loadStartedAt)),
        ),
      );
    } finally {
      if (webgpuTts) await disposeModel(webgpuTts);
    }
  }

  try {
    await audioContext?.close();
  } catch {
    // Optional dev playback cleanup must not hide the report.
  }
  progress("Benchmark 완료");

  return {
    inputChars: normalizedText.length,
    voice: "af_bella",
    synthesisRate: KOKORO_SYNTHESIS_RATE,
    productionDefault: { dtype: KOKORO_DTYPE, device: KOKORO_DEVICE },
    environment,
    results,
  };
}
