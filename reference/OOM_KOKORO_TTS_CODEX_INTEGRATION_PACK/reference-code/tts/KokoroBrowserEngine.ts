import type {
  TtsAudio,
  TtsEngine,
  TtsGenerateInput,
} from "./types";

type Pending = {
  resolve: (audio: TtsAudio) => void;
  reject: (error: Error) => void;
  voice: TtsGenerateInput["voice"];
};

export class KokoroBrowserEngine implements TtsEngine {
  private worker: Worker;
  private pending = new Map<string, Pending>();
  private queue: Promise<unknown> = Promise.resolve();

  constructor(workerUrl: URL) {
    this.worker = new Worker(workerUrl, { type: "module" });

    this.worker.addEventListener("message", (event) => {
      const message = event.data;

      if (message.type === "generated") {
        const pending = this.pending.get(message.requestId);
        if (!pending) return;

        this.pending.delete(message.requestId);
        pending.resolve({
          blob: message.blob,
          mimeType: message.blob.type || "audio/wav",
          engine: "kokoro",
          voice: pending.voice,
        });
        return;
      }

      if (message.type === "generate-error") {
        const pending = this.pending.get(message.requestId);
        if (!pending) return;

        this.pending.delete(message.requestId);
        pending.reject(new Error(message.error || "Kokoro generation failed"));
      }
    });
  }

  generate(input: TtsGenerateInput) {
    const run = () =>
      new Promise<TtsAudio>((resolve, reject) => {
        const requestId = crypto.randomUUID();

        this.pending.set(requestId, {
          resolve,
          reject,
          voice: input.voice,
        });

        this.worker.postMessage({
          type: "generate",
          requestId,
          text: input.text,
          voice: input.voice,
          speed: input.speed ?? 1,
        });
      });

    const task = this.queue.then(run, run);
    this.queue = task.catch(() => undefined);

    return task;
  }

  dispose() {
    this.worker.terminate();
  }
}
