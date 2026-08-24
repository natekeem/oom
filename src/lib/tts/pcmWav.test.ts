import { describe, expect, it } from "vitest";
import { concatenatePcmChunks, encodePcm16Wav, splitTtsText } from "./pcmWav";

describe("segmented Kokoro WAV generation", () => {
  it("splits long scripts at sentence and paragraph boundaries without dropping text", () => {
    expect(splitTtsText("First sentence. Second sentence!\n\nThird question? ")).toEqual([
      "First sentence.",
      "Second sentence!",
      "Third question?",
    ]);
  });

  it("joins every PCM segment with short silence and writes a valid mono WAV", async () => {
    const combined = concatenatePcmChunks(
      [
        { audio: new Float32Array([0, 0.5]), sampleRate: 10 },
        { audio: new Float32Array([-0.5, 0]), sampleRate: 10 },
      ],
      0.2,
    );

    expect([...combined.audio]).toEqual([0, 0.5, 0, 0, -0.5, 0]);
    const blob = encodePcm16Wav(combined.audio, combined.sampleRate);
    const buffer = await readBlob(blob);
    const view = new DataView(buffer);

    expect(blob.type).toBe("audio/wav");
    expect(String.fromCharCode(...new Uint8Array(view.buffer, 0, 4))).toBe("RIFF");
    expect(String.fromCharCode(...new Uint8Array(view.buffer, 8, 4))).toBe("WAVE");
    expect(view.getUint32(24, true)).toBe(10);
    expect(view.getUint32(40, true)).toBe(combined.audio.length * 2);
  });
});

function readBlob(blob: Blob) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.readAsArrayBuffer(blob);
  });
}
