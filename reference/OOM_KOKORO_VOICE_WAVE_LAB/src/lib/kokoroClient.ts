import type { LoadState } from "./types";

type Pending = {
  resolve: (value: { blob: Blob; elapsedMs: number }) => void;
  reject: (error: Error) => void;
};

class KokoroClient {
  private worker: Worker;
  private pending = new Map<string, Pending>();
  private queue: Promise<unknown> = Promise.resolve();
  private loadListeners = new Set<(state: LoadState) => void>();

  constructor() {
    this.worker = new Worker(
      new URL("../workers/kokoro.worker.ts", import.meta.url),
      { type: "module" },
    );

    this.worker.addEventListener("message", (event) => {
      const message = event.data;

      if (message.type === "load-state") {
        const state: LoadState =
          message.status === "ready"
            ? {
                status: "ready",
                progress: 100,
                detail: message.detail ?? "준비 완료",
              }
            : message.status === "error"
              ? {
                  status: "error",
                  progress: message.progress ?? 0,
                  detail: message.detail ?? "모델 로드 실패",
                }
              : {
                  status: "loading",
                  progress: Number.isFinite(message.progress)
                    ? message.progress
                    : 0,
                  detail: message.detail ?? "로딩 중",
                };

        this.loadListeners.forEach((listener) => listener(state));
        return;
      }

      if (message.type === "generated") {
        const pending = this.pending.get(message.requestId);
        if (!pending) return;
        this.pending.delete(message.requestId);
        pending.resolve({
          blob: message.blob,
          elapsedMs: message.elapsedMs,
        });
        return;
      }

      if (message.type === "generate-error") {
        const pending = this.pending.get(message.requestId);
        if (!pending) return;
        this.pending.delete(message.requestId);
        pending.reject(new Error(message.error ?? "TTS generation failed"));
      }
    });
  }

  subscribeLoad(listener: (state: LoadState) => void) {
    this.loadListeners.add(listener);
    return () => {
      this.loadListeners.delete(listener);
    };
  }

  load() {
    this.worker.postMessage({ type: "load" });
  }

  generate(args: { text: string; voice: string; speed: number }) {
    const request = () =>
      new Promise<{ blob: Blob; elapsedMs: number }>((resolve, reject) => {
        const requestId = crypto.randomUUID();
        this.pending.set(requestId, { resolve, reject });
        this.worker.postMessage({
          type: "generate",
          requestId,
          ...args,
        });
      });

    const task = this.queue.then(request, request);
    this.queue = task.catch(() => undefined);
    return task;
  }
}

export const kokoroClient = new KokoroClient();
