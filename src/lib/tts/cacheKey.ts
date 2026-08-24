import { KOKORO_MODEL_VERSION } from "./kokoroConfig";
import type { TtsGenerateInput } from "./types";

export type TtsCacheIdentity = {
  key: string;
  modelVersion: string;
  voice: TtsGenerateInput["voice"];
  rate: number;
  textHash: string;
};

export function normalizeTtsText(text: string) {
  return text.trim().replace(/\s+/g, " ");
}

function fallbackTextHash(text: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

async function hashText(text: string) {
  if (typeof crypto !== "undefined" && crypto.subtle && typeof TextEncoder !== "undefined") {
    try {
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    } catch {
      // Hashing must never make the optional cache a playback dependency.
    }
  }

  return fallbackTextHash(text);
}

export async function createTtsCacheIdentity(
  input: TtsGenerateInput,
  modelVersion = KOKORO_MODEL_VERSION,
): Promise<TtsCacheIdentity> {
  const rate = input.speed ?? 1;
  const textHash = await hashText(normalizeTtsText(input.text));
  const rateKey = rate.toString();

  return {
    key: `${modelVersion}:${input.voice}:${rateKey}:${textHash}`,
    modelVersion,
    voice: input.voice,
    rate,
    textHash,
  };
}
