import { describe, expect, it } from "vitest";
import {
  computePcm16Waveform,
  selectPilotTargets,
  STATIC_TTS_PEAK_COUNT,
} from "./static-tts-assets.mjs";

function pcmWav(samples, sampleRate = 24_000) {
  const buffer = Buffer.alloc(44 + samples.length * 2);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + samples.length * 2, 4);
  buffer.write("WAVEfmt ", 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((sample, index) => buffer.writeInt16LE(sample, 44 + index * 2));
  return buffer;
}

describe("static TTS asset helpers", () => {
  it("creates deterministic non-placeholder normalized peaks from PCM16", () => {
    const samples = Array.from({ length: 24_000 }, (_, index) =>
      Math.round(Math.sin(index / 20) * (index < 12_000 ? 4_000 : 12_000)),
    );
    const first = computePcm16Waveform(pcmWav(samples));
    const second = computePcm16Waveform(pcmWav(samples));
    expect(first).toEqual(second);
    expect(first.peaks).toHaveLength(STATIC_TTS_PEAK_COUNT);
    expect(Math.max(...first.peaks)).toBe(1);
    expect(first.peaks.slice(128).reduce((sum, peak) => sum + peak, 0)).toBeGreaterThan(
      first.peaks.slice(0, 128).reduce((sum, peak) => sum + peak, 0),
    );
  });

  it("rejects silent PCM instead of accepting fake waveform data", () => {
    expect(() => computePcm16Waveform(pcmWav(Array(24_000).fill(0)))).toThrow("silent");
  });

  it("selects exactly preview, short question, and long script across four voices", () => {
    const targets = [
      ["preview", ["voice-preview"], 5, 20],
      ["question", ["step6-question"], 3, 30],
      ["script", ["step4-canonical"], 100, 900],
    ].flatMap(([textHash, categories, words, characters]) =>
      ["heart", "bella", "sarah", "sky"].map((voiceAlias) => ({
        textHash,
        categories,
        words,
        characters,
        voiceAlias,
      })),
    );
    expect(selectPilotTargets(targets)).toHaveLength(12);
  });
});
