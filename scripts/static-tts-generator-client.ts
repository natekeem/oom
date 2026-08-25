import { KokoroTTS } from "kokoro-js";
import WaveSurfer from "wavesurfer.js";
import {
  concatenatePcmChunks,
  encodePcm16Wav,
  splitTtsText,
  type PcmAudioChunk,
} from "/src/lib/tts/pcmWav.ts";

type GeneratorTarget = {
  targetKey: string;
  textHash: string;
  text: string;
  characters: number;
  words: number;
  categories: string[];
  voiceId: "af_heart" | "af_bella" | "af_sarah" | "af_sky";
  voiceAlias: string;
  audioUrl: string;
  peaksUrl: string;
  ordinal: number;
  total: number;
  hit: boolean;
};

type Plan = {
  mode: "pilot" | "playable";
  expectedTexts: number;
  expectedTargets: number;
  currentValidTargets: number;
  targets: GeneratorTarget[];
};

type GeneratorEngine = {
  tts: KokoroTTS;
  dtype: "fp32" | "q8";
  device: "webgpu" | "wasm";
};

const modelId = "onnx-community/Kokoro-82M-v1.0-ONNX";
const status = document.querySelector<HTMLElement>("#generator-status")!;
const runButton = document.querySelector<HTMLButtonElement>("#run-generator")!;
const stopButton = document.querySelector<HTMLButtonElement>("#stop-generator")!;
const log = document.querySelector<HTMLElement>("#generator-log")!;
const results = document.querySelector<HTMLElement>("#pilot-results")!;
let stopped = false;

function line(message: string, tone: "normal" | "error" = "normal") {
  const item = document.createElement("div");
  item.textContent = message;
  if (tone === "error") item.className = "error";
  log.append(item);
  log.scrollTop = log.scrollHeight;
}

async function json<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json() as Promise<T>;
}

async function loadEngine(): Promise<GeneratorEngine> {
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } }).gpu;
  if (gpu) {
    try {
      const adapter = await gpu.requestAdapter();
      if (adapter) {
        status.textContent = "fp32 WebGPU 모델 로드 중";
        const tts = await KokoroTTS.from_pretrained(modelId, {
          dtype: "fp32",
          device: "webgpu",
          progress_callback: (payload) => {
            if (typeof payload.progress === "number") {
              status.textContent = `fp32 WebGPU 모델 로드 · ${Math.round(payload.progress)}%`;
            }
          },
        });
        return { tts, dtype: "fp32", device: "webgpu" };
      }
    } catch (error) {
      line(`WebGPU unavailable after probe: ${error instanceof Error ? error.message : String(error)}`, "error");
    }
  }

  status.textContent = "q8 WASM fallback 모델 로드 중";
  const tts = await KokoroTTS.from_pretrained(modelId, {
    dtype: "q8",
    device: "wasm",
    progress_callback: (payload) => {
      if (typeof payload.progress === "number") {
        status.textContent = `q8 WASM 모델 로드 · ${Math.round(payload.progress)}%`;
      }
    },
  });
  return { tts, dtype: "q8", device: "wasm" };
}

async function generateWav(engine: GeneratorEngine, target: GeneratorTarget) {
  const segments = splitTtsText(target.text);
  const chunks: PcmAudioChunk[] = [];
  for (let index = 0; index < segments.length; index += 1) {
    if (stopped) throw new Error("Generator stopped by user");
    status.textContent = `[${target.ordinal}/${target.total}] ${target.voiceAlias} · segment ${index + 1}/${segments.length}`;
    const audio = await engine.tts.generate(segments[index], {
      voice: target.voiceId,
      speed: 1,
    });
    chunks.push({ audio: audio.audio, sampleRate: audio.sampling_rate });
  }
  const combined = concatenatePcmChunks(chunks);
  return encodePcm16Wav(combined.audio, combined.sampleRate);
}

async function upload(target: GeneratorTarget, wav: Blob, engine: GeneratorEngine) {
  const response = await fetch(
    `/__tts-generator/asset?targetKey=${encodeURIComponent(target.targetKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "audio/wav",
        "X-OOM-Generator-Dtype": engine.dtype,
        "X-OOM-Generator-Device": engine.device,
      },
      body: wav,
    },
  );
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || `${response.status} ${response.statusText}`);
  return result;
}

async function renderPilot(targets: GeneratorTarget[]) {
  results.replaceChildren();
  for (const target of targets) {
    const peaks = await json<{ duration: number; peaks: number[] }>(`${target.peaksUrl}?v=${Date.now()}`);
    const card = document.createElement("article");
    card.className = "pilot-card";
    card.innerHTML = `<strong>${target.voiceAlias}</strong><span>${target.categories.join(", ")}</span>`;
    const wave = document.createElement("div");
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.preload = "metadata";
    audio.src = target.audioUrl;
    card.append(wave, audio);
    results.append(card);
    WaveSurfer.create({
      container: wave,
      url: target.audioUrl,
      peaks: [peaks.peaks],
      duration: peaks.duration,
      height: 48,
      waveColor: "#71717a",
      progressColor: "#6366f1",
      interact: false,
      cursorWidth: 0,
      barWidth: 2,
      barGap: 2,
    });
  }
}

async function run() {
  runButton.disabled = true;
  stopButton.disabled = false;
  stopped = false;
  log.replaceChildren();
  const plan = await json<Plan>("/__tts-generator/plan");
  status.textContent = `${plan.mode}: ${plan.targets.length} targets · ${plan.currentValidTargets} already valid`;
  line(`Inventory ${plan.expectedTexts} texts / ${plan.expectedTargets} voice targets`);

  const missing = plan.targets.filter((target) => !target.hit);
  for (const target of plan.targets.filter((target) => target.hit)) {
    line(`[${String(target.ordinal).padStart(3, "0")}/${target.total}] HIT  ${target.textHash.slice(0, 12)} ${target.voiceAlias}`);
  }

  let engine: GeneratorEngine | null = null;
  const errors: string[] = [];
  try {
    if (missing.length > 0) {
      engine = await loadEngine();
      line(`Engine ${engine.dtype}/${engine.device}`);
    }
    for (const target of missing) {
      if (stopped) break;
      try {
        const startedAt = performance.now();
        const wav = await generateWav(engine!, target);
        const result = await upload(target, wav, engine!);
        line(
          `[${String(target.ordinal).padStart(3, "0")}/${target.total}] GEN  ${target.textHash.slice(0, 12)} ${target.voiceAlias} · ${(result.metadata.duration).toFixed(2)}s · ${(performance.now() - startedAt).toFixed(0)}ms`,
        );
      } catch (error) {
        const message = `${target.targetKey}: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(message);
        line(`ERROR ${message}`, "error");
      }
    }
  } finally {
    try {
      await engine?.tts.model?.dispose?.();
    } catch {
      // Generator cleanup must not hide completed assets.
    }
  }

  const finalStatus = await json<{ count: number; expectedTargets: number; complete: boolean }>(
    "/__tts-generator/status",
  );
  status.textContent = stopped
    ? `중지됨 · valid ${finalStatus.count}/${finalStatus.expectedTargets}`
    : errors.length
      ? `오류 ${errors.length}개 · valid ${finalStatus.count}/${finalStatus.expectedTargets}`
      : `완료 · valid ${finalStatus.count}/${finalStatus.expectedTargets}`;
  if (plan.mode === "pilot" && !stopped && errors.length === 0) await renderPilot(plan.targets);
  runButton.disabled = false;
  stopButton.disabled = true;
}

runButton.addEventListener("click", () => void run().catch((error) => {
  status.textContent = error instanceof Error ? error.message : String(error);
  line(status.textContent, "error");
  runButton.disabled = false;
  stopButton.disabled = true;
}));
stopButton.addEventListener("click", () => {
  stopped = true;
  status.textContent = "현재 target 완료 후 중지 요청됨";
});

const mode = new URLSearchParams(location.search).get("mode") ?? "playable";
document.querySelector<HTMLElement>("#generator-mode")!.textContent = mode;
