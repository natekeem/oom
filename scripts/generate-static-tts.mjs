import { createServer } from "vite";
import {
  assetSummary,
  encodeStaticAsset,
  loadPlayableInventory,
  resolveFfmpegTools,
  scanValidAssets,
  selectPilotTargets,
  STATIC_TTS_EXPECTED_TARGETS,
  writeStaticManifests,
} from "./static-tts-assets.mjs";

const mode = process.argv.includes("--pilot") ? "pilot" : "playable";
const portArgument = process.argv.find((argument) => argument.startsWith("--port="));
const port = portArgument ? Number(portArgument.split("=")[1]) : 5175;
const inventory = await loadPlayableInventory();
const tools = await resolveFfmpegTools();
const modeTargets = mode === "pilot" ? selectPilotTargets(inventory.targets) : inventory.targets;
const targetsByKey = new Map(inventory.targets.map((target) => [target.targetKey, target]));

console.log(`Static TTS inventory: ${inventory.entries.length} texts / ${inventory.targets.length} targets`);
console.log(`Generator mode: ${mode} (${modeTargets.length} targets)`);
console.log(`ffmpeg: ${tools.ffmpeg}`);
console.log(`ffprobe: ${tools.ffprobe}`);
console.log("Checking resumable assets...");
const scan = await scanValidAssets(inventory.targets, tools);
const valid = scan.valid;
if (scan.invalid.length > 0) {
  console.warn(`Invalid existing assets: ${scan.invalid.length}; they will be regenerated when targeted.`);
}
await writeStaticManifests(inventory, valid);

function sendJson(response, statusCode, value) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(value));
}

async function readBody(request, maximumBytes = 25 * 1024 * 1024) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > maximumBytes) throw new Error("Uploaded WAV exceeds 25 MB");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function clientTarget(target, index) {
  return {
    targetKey: target.targetKey,
    textHash: target.textHash,
    text: target.text,
    characters: target.characters,
    words: target.words,
    categories: target.categories,
    voiceId: target.voiceId,
    voiceAlias: target.voiceAlias,
    audioUrl: `/generated-tts/${target.audioRelativeUrl}`,
    peaksUrl: `/generated-tts/${target.peaksRelativeUrl}`,
    ordinal: index + 1,
    total: modeTargets.length,
    hit: valid.has(target.targetKey),
  };
}

const apiPlugin = {
  name: "oom-static-tts-generator-api",
  configureServer(server) {
    server.middlewares.use(async (request, response, next) => {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");
      if (!url.pathname.startsWith("/__tts-generator/")) return next();
      try {
        if (request.method === "GET" && url.pathname === "/__tts-generator/plan") {
          return sendJson(response, 200, {
            mode,
            expectedTexts: inventory.entries.length,
            expectedTargets: STATIC_TTS_EXPECTED_TARGETS,
            currentValidTargets: valid.size,
            targets: modeTargets.map(clientTarget),
          });
        }
        if (request.method === "GET" && url.pathname === "/__tts-generator/status") {
          return sendJson(response, 200, {
            mode,
            ...assetSummary(valid),
            expectedTargets: STATIC_TTS_EXPECTED_TARGETS,
            complete: valid.size === STATIC_TTS_EXPECTED_TARGETS,
          });
        }
        if (request.method === "POST" && url.pathname === "/__tts-generator/asset") {
          const targetKey = url.searchParams.get("targetKey") ?? "";
          const target = targetsByKey.get(targetKey);
          if (!target || !modeTargets.some((item) => item.targetKey === targetKey)) {
            return sendJson(response, 400, { error: "Unknown or out-of-scope target" });
          }
          const dtype = request.headers["x-oom-generator-dtype"];
          const device = request.headers["x-oom-generator-device"];
          if (!['fp32', 'q8'].includes(String(dtype)) || !['webgpu', 'wasm'].includes(String(device))) {
            return sendJson(response, 400, { error: "Missing generator engine metadata" });
          }
          const wav = await readBody(request);
          const metadata = await encodeStaticAsset(target, wav, tools, {
            dtype: String(dtype),
            device: String(device),
          });
          valid.set(targetKey, metadata);
          const manifest = await writeStaticManifests(inventory, valid);
          const summary = assetSummary(valid);
          console.log(
            `[${String(summary.count).padStart(3, "0")}/${STATIC_TTS_EXPECTED_TARGETS}] GEN  ${target.textHash.slice(0, 12)} ${target.voiceAlias}`,
          );
          return sendJson(response, 200, { metadata, coverage: manifest.coverage });
        }
        return sendJson(response, 404, { error: "Unknown generator endpoint" });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(message);
        return sendJson(response, 500, { error: message });
      }
    });
  },
};

const server = await createServer({
  configFile: false,
  plugins: [apiPlugin],
  server: { host: "127.0.0.1", port, strictPort: false },
  appType: "mpa",
});
await server.listen();
const generatorUrl = new URL("/dev-static-tts-generator.html", server.resolvedUrls?.local[0]);
generatorUrl.searchParams.set("mode", mode);
console.log(`Open generator: ${generatorUrl}`);
console.log("Press Ctrl+C after the browser generator reports completion.");

let closing = false;
async function close() {
  if (closing) return;
  closing = true;
  await server.close();
  process.exit(0);
}
process.on("SIGINT", close);
process.on("SIGTERM", close);
