import {
  KOKORO_MODEL_VERSION,
  KOKORO_SYNTHESIS_PROFILE,
} from "./kokoroConfig";
import type { TtsGenerateInput } from "./types";

export type TtsCacheIdentity = {
  key: string;
  modelVersion: string;
  voice: TtsGenerateInput["voice"];
  synthesisProfile: string;
  textHash: string;
};

export function normalizeTtsText(text: string) {
  return text
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .trim()
    .replace(/\s+/gu, " ");
}

function fallbackTextHash(text: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export async function sha256TtsText(text: string): Promise<string | null> {
  if (typeof crypto !== "undefined" && crypto.subtle && typeof TextEncoder !== "undefined") {
    try {
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    } catch {
      // Hashing must never make the optional cache a playback dependency.
    }
  }

  return null;
}

async function hashText(text: string) {
  return (await sha256TtsText(text)) ?? fallbackTextHash(text);
}

export async function createTtsCacheIdentity(
  input: TtsGenerateInput,
  modelVersion = KOKORO_MODEL_VERSION,
  synthesisProfile = KOKORO_SYNTHESIS_PROFILE,
): Promise<TtsCacheIdentity> {
  const textHash = await hashText(normalizeTtsText(input.text));

  return {
    key: `${modelVersion}:${synthesisProfile}:${input.voice}:${textHash}`,
    modelVersion,
    voice: input.voice,
    synthesisProfile,
    textHash,
  };
}
