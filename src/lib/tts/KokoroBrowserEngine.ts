import type {
  TtsAudio,
  TtsEngine,
  TtsGenerateInput,
  TtsStatusListener,
} from "./types";

type WorkerMessage =
  | {
      type: "load-progress";
      requestId: string;
      payload?: { progress?: unknown };
    }
  | { type: "model-ready"; requestId: string }
  | {
      type: "generation-progress";
      requestId: string;
      progress: number;
      completedChunks: number;
      totalChunks: number;
    }
  | {
      type: "generated";
      requestId: string;
      blob: Blob;
      audioDurationSeconds?: number;
      chunkCount?: number;
      generationMs?: number;
    }
  | { type: "generate-error"; requestId: string; error?: string };

type PendingRequest = {
  resolve: (audio: TtsAudio) => void;
  reject: (error: Error) => void;
  voice: TtsGenerateInput["voice"];
  onStatus?: TtsStatusListener;
};

type TtsWorker = Pick<
  Worker,
  "addEventListener" | "postMessage" | "removeEventListener" | "terminate"
>;

type WorkerFactory = () => TtsWorker;

function createDefaultWorker(): TtsWorker {
  if (typeof Worker === "undefined") {
    throw new Error("이 브라우저는 Kokoro 음성 Worker를 지원하지 않습니다.");
  }

  return new Worker(new URL("../../workers/kokoro.worker.ts", import.meta.url), {
    type: "module",
    name: "oom-kokoro-tts",
  });
}

function createRequestId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `oom-tts-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readProgress(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("progress" in payload)) return undefined;
  const progress = (payload as { progress?: unknown }).progress;
  return typeof progress === "number" && Number.isFinite(progress)
    ? Math.max(0, Math.min(100, progress))
    : undefined;
}

export class KokoroBrowserEngine implements TtsEngine {
  private worker: TtsWorker | null = null;
  private readonly pending = new Map<string, PendingRequest>();
  private queue: Promise<unknown> = Promise.resolve();
  private modelReady = false;

  constructor(private readonly workerFactory: WorkerFactory = createDefaultWorker) {}

  private readonly handleMessage = (event: MessageEvent<WorkerMessage>) => {
    const message = event.data;
    const pending = this.pending.get(message.requestId);
    if (!pending) return;

    if (message.type === "load-progress") {
      pending.onStatus?.({
        phase: "loading-model",
        progress: readProgress(message.payload),
      });
      return;
    }

    if (message.type === "model-ready") {
      this.modelReady = true;
      pending.onStatus?.({ phase: "generating" });
      return;
    }

    if (message.type === "generation-progress") {
      pending.onStatus?.({
        phase: "generating",
        progress: message.progress,
        completedChunks: message.completedChunks,
        totalChunks: message.totalChunks,
      });
      return;
    }

    this.pending.delete(message.requestId);

    if (message.type === "generated") {
      pending.onStatus?.({ phase: "ready" });
      pending.resolve({
        blob: message.blob,
        mimeType: message.blob.type || "audio/wav",
        engine: "kokoro",
        voice: pending.voice,
        audioDurationSeconds: message.audioDurationSeconds,
        chunkCount: message.chunkCount,
        engineGenerationMs: message.generationMs,
      });
      return;
    }

    this.modelReady = false;
    pending.reject(new Error(message.error || "Kokoro 음성 생성에 실패했습니다."));
  };

  private readonly handleWorkerError = (event: ErrorEvent) => {
    const error = new Error(event.message || "Kokoro 음성 Worker에 오류가 발생했습니다.");
    this.modelReady = false;
    this.pending.forEach(({ reject }) => reject(error));
    this.pending.clear();
    this.destroyWorker();
  };

  private getWorker() {
    if (!this.worker) {
      this.worker = this.workerFactory();
      this.worker.addEventListener("message", this.handleMessage as EventListener);
      this.worker.addEventListener("error", this.handleWorkerError as EventListener);
    }
    return this.worker;
  }

  private generateNow(input: TtsGenerateInput, onStatus?: TtsStatusListener) {
    return new Promise<TtsAudio>((resolve, reject) => {
      let worker: TtsWorker;

      try {
        worker = this.getWorker();
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
        return;
      }

      const requestId = createRequestId();
      onStatus?.({ phase: this.modelReady ? "generating" : "loading-model" });
      this.pending.set(requestId, { resolve, reject, voice: input.voice, onStatus });
      worker.postMessage({
        type: "generate",
        requestId,
        text: input.text,
        voice: input.voice,
      });
    });
  }

  generate(input: TtsGenerateInput, onStatus?: TtsStatusListener) {
    const run = () => this.generateNow(input, onStatus);
    const task = this.queue.then(run, run);
    this.queue = task.catch(() => undefined);
    return task;
  }

  private destroyWorker() {
    if (!this.worker) return;
    this.worker.removeEventListener("message", this.handleMessage as EventListener);
    this.worker.removeEventListener("error", this.handleWorkerError as EventListener);
    this.worker.terminate();
    this.worker = null;
  }

  dispose() {
    const error = new Error("Kokoro 음성 Worker가 종료되었습니다.");
    this.pending.forEach(({ reject }) => reject(error));
    this.pending.clear();
    this.modelReady = false;
    this.destroyWorker();
  }
}
