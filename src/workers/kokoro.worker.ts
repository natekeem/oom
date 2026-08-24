/// <reference lib="webworker" />

import { KokoroTTS } from "kokoro-js";
import {
  KOKORO_DEVICE,
  KOKORO_DTYPE,
  KOKORO_MODEL_ID,
} from "../lib/tts/kokoroConfig";
import type { OomVoiceId } from "../lib/tts/types";
import {
  concatenatePcmChunks,
  encodePcm16Wav,
  splitTtsText,
  type PcmAudioChunk,
} from "../lib/tts/pcmWav";

type GenerateMessage = {
  type: "generate";
  requestId: string;
  text: string;
  voice: OomVoiceId;
  speed: number;
};

let ttsPromise: Promise<KokoroTTS> | null = null;

async function getTts(requestId: string) {
  if (!ttsPromise) {
    ttsPromise = KokoroTTS.from_pretrained(KOKORO_MODEL_ID, {
      dtype: KOKORO_DTYPE,
      device: KOKORO_DEVICE,
      progress_callback: (payload) => {
        self.postMessage({ type: "load-progress", requestId, payload });
      },
    });
  }

  try {
    return await ttsPromise;
  } catch (error) {
    ttsPromise = null;
    throw error;
  }
}

self.addEventListener("message", async (event: MessageEvent<GenerateMessage>) => {
  const message = event.data;
  if (message.type !== "generate") return;

  try {
    const tts = await getTts(message.requestId);
    self.postMessage({ type: "model-ready", requestId: message.requestId });

    const segments = splitTtsText(message.text);
    const chunks: PcmAudioChunk[] = [];

    for (let index = 0; index < segments.length; index += 1) {
      const audio = await tts.generate(segments[index], {
        voice: message.voice,
        speed: message.speed,
      });
      chunks.push({ audio: audio.audio, sampleRate: audio.sampling_rate });
      self.postMessage({
        type: "generation-progress",
        requestId: message.requestId,
        progress: ((index + 1) / segments.length) * 100,
      });
    }

    const combined = concatenatePcmChunks(chunks);

    self.postMessage({
      type: "generated",
      requestId: message.requestId,
      blob: encodePcm16Wav(combined.audio, combined.sampleRate),
    });
  } catch (error) {
    self.postMessage({
      type: "generate-error",
      requestId: message.requestId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

export {};
