import { describe, expect, it } from "vitest";
import {
  countTtsWords,
  hashTtsText,
  normalizeTtsText,
  summarizeInventory,
} from "./tts-inventory-core.mjs";

function item(text, logicalId) {
  const normalizedText = normalizeTtsText(text);
  const words = countTtsWords(normalizedText);
  return {
    logicalId,
    normalizedText,
    textHash: hashTtsText(normalizedText),
    words,
    estimatedDurationSeconds: (words / 150) * 60,
  };
}

describe("TTS inventory normalization", () => {
  it("is deterministic and preserves meaningful case and punctuation", () => {
    const text = "  Don't change THIS.\r\nNext line?  ";
    expect(normalizeTtsText(text)).toBe("Don't change THIS. Next line?");
    expect(hashTtsText(text)).toBe(hashTtsText(text));
    expect(hashTtsText("Don't change this. Next line?")).not.toBe(hashTtsText(text));
    expect(hashTtsText("Don't change THIS! Next line?")).not.toBe(hashTtsText(text));
  });

  it("dedupes trim, newline, and consecutive whitespace differences", () => {
    const first = "First sentence.\n\nSecond sentence.";
    const second = "  First   sentence.\r\nSecond sentence.  ";
    expect(normalizeTtsText(first)).toBe(normalizeTtsText(second));
    expect(hashTtsText(first)).toBe(hashTtsText(second));
  });

  it("normalizes canonically equivalent Unicode to NFC", () => {
    expect(hashTtsText("Caf\u00e9")).toBe(hashTtsText("Cafe\u0301"));
  });
});

describe("TTS inventory counts", () => {
  it("separates logical item count from unique text count", () => {
    const records = [
      item("Same text.", "one"),
      item(" Same   text. ", "two"),
      item("Different text.", "three"),
    ];
    expect(summarizeInventory(records)).toMatchObject({
      logicalItems: 3,
      uniqueTexts: 2,
      duplicateItems: 1,
      duplicateSavingsPct: 33.33,
      fourVoiceFiles: 8,
    });
  });
});
