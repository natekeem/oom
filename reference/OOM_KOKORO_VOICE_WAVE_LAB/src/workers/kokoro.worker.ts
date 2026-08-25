/// <reference lib="webworker" />

import { KokoroTTS } from "kokoro-js";

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";

type WorkerRequest =
  | { type: "load" }
  | {
      type: "generate";
      requestId: string;
      text: string;
      voice: string;
      speed: number;
    };

type ProgressEvent = {
  progress?: number;
  loaded?: number;
  total?: number;
  file?: string;
  status?: string;
};

let ttsPromise: Promise<any> | null = null;
let modelReady = false;

function normalizedProgress(item: ProgressEvent): number {
  if (typeof item.progress === "number" && Number.isFinite(item.progress)) {
    return Math.max(0, Math.min(100, item.progress));
  }
  if (
    typeof item.loaded === "number" &&
    typeof item.total === "number" &&
    item.total > 0
  ) {
    return Math.max(0, Math.min(100, (item.loaded / item.total) * 100));
  }
  return -1;
}

async function getTts() {
  if (!ttsPromise) {
    self.postMessage({
      type: "load-state",
      status: "loading",
      progress: 0,
      detail: "Kokoro q8 모델을 불러오는 중입니다.",
    });

    ttsPromise = KokoroTTS.from_pretrained(MODEL_ID, {
      dtype: "q8",
      device: "wasm",
      progress_callback: (item: ProgressEvent) => {
        const progress = normalizedProgress(item);
        self.postMessage({
          type: "load-state",
          status: "loading",
          progress: progress >= 0 ? progress : 0,
          detail:
            item.file ??
            item.status ??
            "모델 파일을 다운로드/캐시하는 중입니다.",
        });
      },
    })
      .then((tts) => {
        modelReady = true;
        self.postMessage({
          type: "load-state",
          status: "ready",
          progress: 100,
          detail: "Kokoro q8 / WASM 준비 완료",
        });
        return tts;
      })
      .catch((error) => {
        ttsPromise = null;
        modelReady = false;
        self.postMessage({
          type: "load-state",
          status: "error",
          progress: 0,
          detail: error instanceof Error ? error.message : String(error),
        });
        throw error;
      });
  }
  return ttsPromise;
}

self.addEventListener("message", async (event: MessageEvent<WorkerRequest>) => {
  const message = event.data;

  if (message.type === "load") {
    try {
      await getTts();
    } catch {
      // Error state is posted by getTts().
    }
    return;
  }

  if (message.type === "generate") {
    const startedAt = performance.now();

    try {
      const tts = await getTts();
      self.postMessage({
        type: "generate-state",
        requestId: message.requestId,
        status: "generating",
      });

      const audio = await tts.generate(message.text, {
        voice: message.voice,
        speed: message.speed,
      });

      const blob = audio.toBlob();

      self.postMessage({
        type: "generated",
        requestId: message.requestId,
        blob,
        elapsedMs: performance.now() - startedAt,
        modelReady,
      });
    } catch (error) {
      self.postMessage({
        type: "generate-error",
        requestId: message.requestId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
});

export {};
