/// <reference lib="webworker" />

import { KokoroTTS } from "kokoro-js";

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";

let ttsPromise: Promise<any> | null = null;

async function getTts() {
  if (!ttsPromise) {
    ttsPromise = KokoroTTS.from_pretrained(MODEL_ID, {
      dtype: "q8",
      device: "wasm",
      progress_callback: (item: unknown) => {
        self.postMessage({
          type: "load-progress",
          payload: item,
        });
      },
    });
  }

  return ttsPromise;
}

self.addEventListener("message", async (event) => {
  const message = event.data;

  if (message.type === "load") {
    try {
      await getTts();
      self.postMessage({ type: "ready" });
    } catch (error) {
      self.postMessage({
        type: "load-error",
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return;
  }

  if (message.type === "generate") {
    try {
      const tts = await getTts();
      const audio = await tts.generate(message.text, {
        voice: message.voice,
        speed: message.speed ?? 1,
      });

      self.postMessage({
        type: "generated",
        requestId: message.requestId,
        blob: audio.toBlob(),
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
