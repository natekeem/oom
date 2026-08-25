import { createHash } from "node:crypto";

const voiceCount = 4;

function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}

export function normalizeTtsText(text) {
  return String(text)
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .trim()
    .replace(/\s+/gu, " ");
}

export function hashTtsText(text) {
  return createHash("sha256").update(normalizeTtsText(text), "utf8").digest("hex");
}

export function countTtsWords(text) {
  const normalized = normalizeTtsText(text);
  return normalized ? normalized.split(/\s+/u).length : 0;
}

export function summarizeInventory(records) {
  const uniqueByHash = new Map();
  for (const item of records) {
    if (!uniqueByHash.has(item.textHash)) uniqueByHash.set(item.textHash, item);
  }
  const logicalItems = records.length;
  const uniqueTexts = uniqueByHash.size;
  const duplicateItems = logicalItems - uniqueTexts;
  const estimatedDurationSeconds = [...uniqueByHash.values()].reduce(
    (total, item) => total + item.estimatedDurationSeconds,
    0,
  );
  const fourVoiceSeconds = estimatedDurationSeconds * voiceCount;
  return {
    logicalItems,
    uniqueTexts,
    duplicateItems,
    duplicateSavingsPct: logicalItems ? round((duplicateItems / logicalItems) * 100, 2) : 0,
    estimatedSingleVoiceMinutes: round(estimatedDurationSeconds / 60, 2),
    estimatedFourVoiceMinutes: round(fourVoiceSeconds / 60, 2),
    fourVoiceFiles: uniqueTexts * voiceCount,
    storageBytes: {
      wavPcm24kMono16: Math.round(fourVoiceSeconds * 48_000),
      opus48k: Math.round(fourVoiceSeconds * 6_000),
      opus64k: Math.round(fourVoiceSeconds * 8_000),
    },
  };
}
