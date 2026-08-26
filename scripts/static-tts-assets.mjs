import { execFile as execFileCallback, spawnSync } from "node:child_process";
import { promisify } from "node:util";
import {
  access,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { hashTtsText, normalizeTtsText } from "./tts-inventory-core.mjs";

const execFile = promisify(execFileCallback);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const STATIC_TTS_PROFILE = "kokoro-82m-natural-1.0-v1";
export const STATIC_TTS_NORMALIZATION = "unicode-nfc-trim-whitespace-v1";
export const STATIC_TTS_PEAK_COUNT = 256;
export const STATIC_TTS_EXPECTED_TEXTS = 177;
export const STATIC_TTS_EXPECTED_TARGETS = 708;
export const STATIC_TTS_MIN_BYTES = 1_024;
export const STATIC_TTS_MIN_DURATION_SECONDS = 0.3;
export const STATIC_TTS_INVENTORY_PATH = join(root, "artifacts", "tts-inventory.json");
export const STATIC_TTS_PUBLIC_ROOT = join(root, "public", "generated-tts");
export const STATIC_TTS_AUDIO_ROOT = join(STATIC_TTS_PUBLIC_ROOT, "audio");
export const STATIC_TTS_STAGING_MANIFEST_PATH = join(
  STATIC_TTS_PUBLIC_ROOT,
  "tts-manifest.staging.json",
);
export const STATIC_TTS_MANIFEST_PATH = join(STATIC_TTS_PUBLIC_ROOT, "tts-manifest.json");

export const STATIC_TTS_VOICES = [
  { id: "af_heart", alias: "heart" },
  { id: "af_bella", alias: "bella" },
  { id: "af_sarah", alias: "sarah" },
  { id: "af_sky", alias: "sky" },
];

const playableCategories = new Set([
  "step4-canonical",
  "step5-roleplay-example",
  "step6-question",
  "voice-preview",
  "other-static",
]);

function sourceReference(record) {
  const source = {
    type: record.sourceType,
    sourcePath: record.sourcePath,
    sourceKey: record.sourceKey,
  };
  for (const key of ["courseId", "levelId", "storylineId", "roleplayId", "questionId"]) {
    if (record[key]) source[key] = record[key];
  }
  return source;
}

function uniqueSources(records) {
  const sources = new Map();
  for (const record of records) {
    const source = sourceReference(record);
    sources.set(JSON.stringify(source), source);
  }
  return [...sources.values()].sort((left, right) =>
    JSON.stringify(left).localeCompare(JSON.stringify(right)),
  );
}

export async function loadPlayableInventory() {
  const audit = JSON.parse(await readFile(STATIC_TTS_INVENTORY_PATH, "utf8"));
  const records = audit.records.filter(
    (record) => record.currentTtsConsumer === true && playableCategories.has(record.category),
  );
  const grouped = new Map();

  for (const record of records) {
    const normalizedText = normalizeTtsText(record.text);
    const textHash = hashTtsText(normalizedText);
    if (textHash !== record.textHash) {
      throw new Error(`Inventory hash mismatch: ${record.logicalId}`);
    }

    const group = grouped.get(textHash) ?? [];
    if (group.some((item) => normalizeTtsText(item.text) !== normalizedText)) {
      throw new Error(`SHA-256 collision or inconsistent inventory text: ${textHash}`);
    }
    group.push(record);
    grouped.set(textHash, group);
  }

  const entries = [...grouped.entries()]
    .map(([textHash, items]) => ({
      textHash,
      text: normalizeTtsText(items[0].text),
      characters: items[0].characters,
      words: items[0].words,
      categories: [...new Set(items.map((item) => item.category))].sort(),
      sources: uniqueSources(items),
    }))
    .sort((left, right) => left.textHash.localeCompare(right.textHash));

  if (entries.length !== STATIC_TTS_EXPECTED_TEXTS) {
    throw new Error(
      `Playable inventory must contain ${STATIC_TTS_EXPECTED_TEXTS} unique texts; found ${entries.length}`,
    );
  }
  const categoryCounts = {
    "voice-preview": entries.filter((entry) => entry.categories.includes("voice-preview")).length,
    "step4-canonical": entries.filter((entry) => entry.categories.includes("step4-canonical")).length,
    "step5-roleplay-example": entries.filter((entry) =>
      entry.categories.includes("step5-roleplay-example"),
    ).length,
    "step6-question": entries.filter((entry) => entry.categories.includes("step6-question")).length,
    "other-static": entries.filter((entry) => entry.categories.includes("other-static")).length,
  };
  const expectedCategoryCounts = {
    "voice-preview": 2,
    "step4-canonical": 36,
    "step5-roleplay-example": 27,
    "step6-question": 108,
    "other-static": 4,
  };
  if (JSON.stringify(categoryCounts) !== JSON.stringify(expectedCategoryCounts)) {
    throw new Error(
      `Playable inventory category mismatch: ${JSON.stringify(categoryCounts)}`,
    );
  }

  const targets = entries.flatMap((entry) =>
    STATIC_TTS_VOICES.map((voice) => ({
      ...entry,
      voiceId: voice.id,
      voiceAlias: voice.alias,
      targetKey: `${entry.textHash}:${voice.id}`,
      audioRelativeUrl: `audio/${entry.textHash}/${voice.alias}.webm`,
      peaksRelativeUrl: `audio/${entry.textHash}/${voice.alias}.peaks.json`,
      audioPath: join(STATIC_TTS_AUDIO_ROOT, entry.textHash, `${voice.alias}.webm`),
      peaksPath: join(
        STATIC_TTS_AUDIO_ROOT,
        entry.textHash,
        `${voice.alias}.peaks.json`,
      ),
    })),
  );

  if (targets.length !== STATIC_TTS_EXPECTED_TARGETS) {
    throw new Error(
      `Playable inventory must contain ${STATIC_TTS_EXPECTED_TARGETS} voice targets; found ${targets.length}`,
    );
  }

  return { audit, entries, targets };
}

export function selectPilotTargets(targets) {
  const uniqueByHash = new Map();
  const entries = targets.filter((target) => {
    if (uniqueByHash.has(target.textHash)) return false;
    uniqueByHash.set(target.textHash, true);
    return true;
  });
  const preview = entries.find((entry) => entry.categories.includes("voice-preview"));
  const question = entries
    .filter((entry) => entry.categories.includes("step6-question"))
    .sort((left, right) => left.words - right.words || left.textHash.localeCompare(right.textHash))[0];
  const script = entries
    .filter((entry) => entry.categories.includes("step4-canonical"))
    .sort(
      (left, right) =>
        right.characters - left.characters || left.textHash.localeCompare(right.textHash),
    )[0];
  const hashes = new Set([preview?.textHash, question?.textHash, script?.textHash].filter(Boolean));
  const selected = targets.filter((target) => hashes.has(target.textHash));
  if (selected.length !== 12) {
    throw new Error(`Pilot must contain 3 texts × 4 voices; found ${selected.length}`);
  }
  return selected;
}

async function exists(path) {
  try {
    await access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function executableFromPath(name) {
  const command = process.platform === "win32" ? "where.exe" : "which";
  const result = spawnSync(command, [name], { encoding: "utf8", windowsHide: true });
  return result.status === 0 ? result.stdout.split(/\r?\n/).find(Boolean) : undefined;
}

async function findExecutableRecursively(directory, filename, depth = 0) {
  if (depth > 5 || !(await exists(directory))) return undefined;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isFile() && entry.name.toLowerCase() === filename.toLowerCase()) return path;
    if (entry.isDirectory()) {
      const nested = await findExecutableRecursively(path, filename, depth + 1);
      if (nested) return nested;
    }
  }
  return undefined;
}

export async function resolveFfmpegTools() {
  const extension = process.platform === "win32" ? ".exe" : "";
  const portableRoot = process.env.USERPROFILE
    ? join(process.env.USERPROFILE, ".codex", "tools", "ffmpeg")
    : "";
  const ffmpeg =
    process.env.OOM_FFMPEG_PATH ||
    executableFromPath("ffmpeg") ||
    (portableRoot
      ? await findExecutableRecursively(portableRoot, `ffmpeg${extension}`)
      : undefined);
  const ffprobe =
    process.env.OOM_FFPROBE_PATH ||
    executableFromPath("ffprobe") ||
    (portableRoot
      ? await findExecutableRecursively(portableRoot, `ffprobe${extension}`)
      : undefined);

  if (!ffmpeg || !ffprobe) {
    throw new Error(
      "ffmpeg/ffprobe not found. Set OOM_FFMPEG_PATH and OOM_FFPROBE_PATH to portable development binaries.",
    );
  }

  return { ffmpeg, ffprobe };
}

function readAscii(buffer, offset, length) {
  return buffer.toString("ascii", offset, offset + length);
}

export function computePcm16Waveform(buffer, peakCount = STATIC_TTS_PEAK_COUNT) {
  if (readAscii(buffer, 0, 4) !== "RIFF" || readAscii(buffer, 8, 4) !== "WAVE") {
    throw new Error("Generated input is not a RIFF/WAVE file");
  }

  let offset = 12;
  let format;
  let dataOffset;
  let dataLength;
  while (offset + 8 <= buffer.length) {
    const chunkId = readAscii(buffer, offset, 4);
    const chunkLength = buffer.readUInt32LE(offset + 4);
    const payloadOffset = offset + 8;
    if (payloadOffset + chunkLength > buffer.length) throw new Error("Invalid WAV chunk length");
    if (chunkId === "fmt ") {
      format = {
        audioFormat: buffer.readUInt16LE(payloadOffset),
        channels: buffer.readUInt16LE(payloadOffset + 2),
        sampleRate: buffer.readUInt32LE(payloadOffset + 4),
        bitsPerSample: buffer.readUInt16LE(payloadOffset + 14),
      };
    }
    if (chunkId === "data") {
      dataOffset = payloadOffset;
      dataLength = chunkLength;
      break;
    }
    offset = payloadOffset + chunkLength + (chunkLength % 2);
  }

  if (!format || format.audioFormat !== 1 || format.channels !== 1 || format.bitsPerSample !== 16) {
    throw new Error("Waveform source must be mono PCM16 WAV");
  }
  if (typeof dataOffset !== "number" || typeof dataLength !== "number" || dataLength < 2) {
    throw new Error("WAV data chunk is missing or empty");
  }

  const sampleCount = Math.floor(dataLength / 2);
  const peaks = [];
  let globalMax = 0;
  for (let windowIndex = 0; windowIndex < peakCount; windowIndex += 1) {
    const start = Math.floor((windowIndex * sampleCount) / peakCount);
    const end = Math.max(start + 1, Math.floor(((windowIndex + 1) * sampleCount) / peakCount));
    let max = 0;
    for (let sampleIndex = start; sampleIndex < Math.min(end, sampleCount); sampleIndex += 1) {
      const amplitude = Math.abs(buffer.readInt16LE(dataOffset + sampleIndex * 2)) / 32_768;
      if (amplitude > max) max = amplitude;
    }
    peaks.push(max);
    if (max > globalMax) globalMax = max;
  }

  if (globalMax < 0.0001) throw new Error("Generated WAV is silent");
  return {
    version: 1,
    method: "pcm16-window-max-global-normalized",
    sampleRate: format.sampleRate,
    duration: sampleCount / format.sampleRate,
    peaks: peaks.map((peak) => Number((peak / globalMax).toFixed(4))),
  };
}

async function runFfmpeg(executable, args) {
  try {
    return await execFile(executable, args, {
      windowsHide: true,
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (error) {
    const message = error?.stderr || error?.message || String(error);
    throw new Error(`FFmpeg command failed: ${message}`);
  }
}

export async function probeWebm(path, tools) {
  const { stdout } = await runFfmpeg(tools.ffprobe, [
    "-v",
    "error",
    "-show_entries",
    "format=duration:stream=codec_name,codec_type,channels,sample_rate",
    "-of",
    "json",
    path,
  ]);
  const probe = JSON.parse(stdout);
  const audioStream = probe.streams?.find((stream) => stream.codec_type === "audio");
  const duration = Number(probe.format?.duration);
  if (!audioStream || audioStream.codec_name !== "opus") throw new Error("WebM audio codec is not Opus");
  if (audioStream.channels !== 1) throw new Error("WebM audio must be mono");
  if (!Number.isFinite(duration) || duration < STATIC_TTS_MIN_DURATION_SECONDS) {
    throw new Error(`Invalid WebM duration: ${probe.format?.duration}`);
  }
  return {
    duration,
    codec: audioStream.codec_name,
    channels: audioStream.channels,
    sampleRate: Number(audioStream.sample_rate),
  };
}

function validatePeaks(value, expectedDuration) {
  if (
    !value ||
    value.version !== 1 ||
    value.method !== "pcm16-window-max-global-normalized" ||
    !Array.isArray(value.peaks) ||
    value.peaks.length !== STATIC_TTS_PEAK_COUNT ||
    value.peaks.some((peak) => !Number.isFinite(peak) || peak < 0 || peak > 1) ||
    !Number.isFinite(value.duration) ||
    value.duration < STATIC_TTS_MIN_DURATION_SECONDS ||
    Math.abs(value.duration - expectedDuration) > 0.15
  ) {
    throw new Error("Invalid precomputed peaks metadata");
  }
  return value;
}

export async function validateStaticAsset(target, tools) {
  const audioStats = await stat(target.audioPath);
  if (!audioStats.isFile() || audioStats.size <= STATIC_TTS_MIN_BYTES) {
    throw new Error("Static audio is missing or too small");
  }
  const probe = await probeWebm(target.audioPath, tools);
  const peaks = validatePeaks(JSON.parse(await readFile(target.peaksPath, "utf8")), probe.duration);
  return {
    bytes: audioStats.size,
    duration: Number(probe.duration.toFixed(3)),
    peaksCount: peaks.peaks.length,
    generator: peaks.generator ?? { dtype: "unknown", device: "unknown" },
  };
}

export async function scanValidAssets(targets, tools, onProgress = () => undefined) {
  const valid = new Map();
  const invalid = [];
  for (let index = 0; index < targets.length; index += 1) {
    const target = targets[index];
    if (!(await exists(target.audioPath)) && !(await exists(target.peaksPath))) continue;
    try {
      valid.set(target.targetKey, await validateStaticAsset(target, tools));
    } catch (error) {
      invalid.push({ targetKey: target.targetKey, error: error instanceof Error ? error.message : String(error) });
    }
    onProgress(index + 1, targets.length);
  }
  return { valid, invalid };
}

export async function encodeStaticAsset(target, wavBuffer, tools, generator) {
  if (hashTtsText(target.text) !== target.textHash) throw new Error("Target text hash mismatch");
  const waveform = computePcm16Waveform(wavBuffer);
  await mkdir(dirname(target.audioPath), { recursive: true });
  const token = `${process.pid}-${Date.now()}`;
  const wavTemp = join(dirname(target.audioPath), `.${target.voiceAlias}.${token}.wav`);
  const webmTemp = join(dirname(target.audioPath), `.${target.voiceAlias}.${token}.webm`);
  const peaksTemp = join(dirname(target.peaksPath), `.${target.voiceAlias}.${token}.peaks.json`);
  try {
    await writeFile(wavTemp, wavBuffer);
    await runFfmpeg(tools.ffmpeg, [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      wavTemp,
      "-map_metadata",
      "-1",
      "-vn",
      "-ac",
      "1",
      "-c:a",
      "libopus",
      "-b:a",
      "64k",
      "-application",
      "voip",
      "-compression_level",
      "10",
      webmTemp,
    ]);
    const probe = await probeWebm(webmTemp, tools);
    const audioStats = await stat(webmTemp);
    if (audioStats.size <= STATIC_TTS_MIN_BYTES) throw new Error("Encoded WebM is too small");
    const peaks = {
      ...waveform,
      duration: Number(probe.duration.toFixed(3)),
      generator,
    };
    validatePeaks(peaks, probe.duration);
    await writeFile(peaksTemp, `${JSON.stringify(peaks)}\n`, "utf8");
    await rm(target.audioPath, { force: true });
    await rm(target.peaksPath, { force: true });
    await rename(webmTemp, target.audioPath);
    await rename(peaksTemp, target.peaksPath);
    return validateStaticAsset(target, tools);
  } finally {
    await rm(wavTemp, { force: true });
    await rm(webmTemp, { force: true });
    await rm(peaksTemp, { force: true });
  }
}

function manifestEntry(entry, targetsByKey, valid) {
  const audio = {};
  for (const voice of STATIC_TTS_VOICES) {
    const target = targetsByKey.get(`${entry.textHash}:${voice.id}`);
    const metadata = valid.get(target?.targetKey);
    if (!target || !metadata) continue;
    audio[voice.id] = {
      url: target.audioRelativeUrl,
      peaksUrl: target.peaksRelativeUrl,
      duration: metadata.duration,
      bytes: metadata.bytes,
      mimeType: "audio/webm; codecs=opus",
      generator: metadata.generator,
    };
  }
  return {
    characters: entry.characters,
    words: entry.words,
    sources: entry.sources,
    audio,
  };
}

export function buildStaticManifest(inventory, valid) {
  const targetsByKey = new Map(inventory.targets.map((target) => [target.targetKey, target]));
  const entries = {};
  for (const entry of inventory.entries) {
    const manifest = manifestEntry(entry, targetsByKey, valid);
    if (Object.keys(manifest.audio).length > 0) entries[entry.textHash] = manifest;
  }
  const generatorProfiles = [...new Set([...valid.values()].map((item) => JSON.stringify(item.generator)))]
    .map((item) => JSON.parse(item))
    .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
  return {
    version: 1,
    model: "kokoro-82m",
    modelId: "onnx-community/Kokoro-82M-v1.0-ONNX",
    synthesisProfile: STATIC_TTS_PROFILE,
    synthesisRate: 1,
    normalization: STATIC_TTS_NORMALIZATION,
    audioFormat: {
      container: "webm",
      codec: "opus",
      mimeType: "audio/webm; codecs=opus",
      bitrateKbps: 64,
      channels: 1,
    },
    waveform: {
      version: 1,
      count: STATIC_TTS_PEAK_COUNT,
      method: "pcm16-window-max-global-normalized",
    },
    voices: STATIC_TTS_VOICES.map((voice) => voice.id),
    generatorProfiles,
    coverage: {
      expectedTexts: STATIC_TTS_EXPECTED_TEXTS,
      expectedVoiceAssets: STATIC_TTS_EXPECTED_TARGETS,
      completedTexts: Object.values(entries).filter(
        (entry) => Object.keys(entry.audio).length === STATIC_TTS_VOICES.length,
      ).length,
      completedVoiceAssets: valid.size,
      complete: valid.size === STATIC_TTS_EXPECTED_TARGETS,
    },
    entries,
  };
}

async function atomicJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const temp = `${path}.${process.pid}.tmp`;
  await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rm(path, { force: true });
  await rename(temp, path);
}

export async function writeStaticManifests(inventory, valid) {
  const manifest = buildStaticManifest(inventory, valid);
  await atomicJson(STATIC_TTS_STAGING_MANIFEST_PATH, manifest);
  if (manifest.coverage.complete) {
    await atomicJson(STATIC_TTS_MANIFEST_PATH, manifest);
  } else {
    await rm(STATIC_TTS_MANIFEST_PATH, { force: true });
  }
  return manifest;
}

export async function findPruneCandidates(entries) {
  if (!(await exists(STATIC_TTS_AUDIO_ROOT))) return [];
  const expected = new Set(entries.map((entry) => entry.textHash));
  const directories = await readdir(STATIC_TTS_AUDIO_ROOT, { withFileTypes: true });
  return directories
    .filter((entry) => entry.isDirectory() && !expected.has(entry.name))
    .map((entry) => relative(root, join(STATIC_TTS_AUDIO_ROOT, entry.name)))
    .sort();
}

export function assetSummary(valid) {
  const items = [...valid.values()];
  const bytes = items.reduce((sum, item) => sum + item.bytes, 0);
  const sizes = items.map((item) => item.bytes);
  return {
    count: items.length,
    peaksCount: items.reduce((sum, item) => sum + (item.peaksCount === STATIC_TTS_PEAK_COUNT ? 1 : 0), 0),
    bytes,
    averageBytes: sizes.length ? Math.round(bytes / sizes.length) : 0,
    maximumBytes: sizes.length ? Math.max(...sizes) : 0,
  };
}
