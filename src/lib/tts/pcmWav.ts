const DEFAULT_SEGMENT_SILENCE_SECONDS = 0.12;

export type PcmAudioChunk = {
  audio: Float32Array;
  sampleRate: number;
};

export function splitTtsText(text: string) {
  const normalized = text.replace(/\r\n?/g, "\n").trim();
  if (!normalized) return [];

  return normalized
    .split(/(?<=[.!?])\s+|\n+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

export function concatenatePcmChunks(
  chunks: PcmAudioChunk[],
  silenceSeconds = DEFAULT_SEGMENT_SILENCE_SECONDS,
) {
  if (chunks.length === 0) {
    throw new Error("Kokoro가 생성한 음성 데이터가 없습니다.");
  }

  const sampleRate = chunks[0].sampleRate;
  if (!Number.isFinite(sampleRate) || sampleRate <= 0) {
    throw new Error("Kokoro 음성의 sample rate가 올바르지 않습니다.");
  }

  if (chunks.some((chunk) => chunk.sampleRate !== sampleRate)) {
    throw new Error("Kokoro 음성 segment의 sample rate가 서로 다릅니다.");
  }

  const silenceLength = Math.max(0, Math.round(sampleRate * silenceSeconds));
  const totalLength =
    chunks.reduce((total, chunk) => total + chunk.audio.length, 0) +
    silenceLength * Math.max(0, chunks.length - 1);
  const combined = new Float32Array(totalLength);
  let offset = 0;

  chunks.forEach((chunk, index) => {
    combined.set(chunk.audio, offset);
    offset += chunk.audio.length;
    if (index < chunks.length - 1) offset += silenceLength;
  });

  return { audio: combined, sampleRate };
}

export function encodePcm16Wav(audio: Float32Array, sampleRate: number) {
  const bytesPerSample = 2;
  const buffer = new ArrayBuffer(44 + audio.length * bytesPerSample);
  const view = new DataView(buffer);

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + audio.length * bytesPerSample, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, audio.length * bytesPerSample, true);

  for (let index = 0; index < audio.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, audio[index]));
    view.setInt16(
      44 + index * bytesPerSample,
      sample < 0 ? sample * 0x8000 : sample * 0x7fff,
      true,
    );
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function writeAscii(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}
