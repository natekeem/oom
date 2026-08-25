import {
  assetSummary,
  findPruneCandidates,
  loadPlayableInventory,
  resolveFfmpegTools,
  scanValidAssets,
  STATIC_TTS_EXPECTED_TARGETS,
  writeStaticManifests,
} from "./static-tts-assets.mjs";

const inventory = await loadPlayableInventory();
const tools = await resolveFfmpegTools();
const { valid, invalid } = await scanValidAssets(inventory.targets, tools, (current, total) => {
  if (current % 50 === 0 || current === total) process.stdout.write(`Validated ${current}/${total}\r`);
});
process.stdout.write("\n");
const manifest = await writeStaticManifests(inventory, valid);
const summary = assetSummary(valid);
const pruneCandidates = await findPruneCandidates(inventory.entries);

console.log(JSON.stringify({
  texts: inventory.entries.length,
  expectedTargets: STATIC_TTS_EXPECTED_TARGETS,
  ...summary,
  invalid,
  coverage: manifest.coverage,
  pruneDryRun: pruneCandidates,
}, null, 2));

if (process.argv.includes("--prune-dry-run")) {
  console.log(`Prune dry-run: ${pruneCandidates.length} unreferenced hash director${pruneCandidates.length === 1 ? "y" : "ies"}.`);
}

if (invalid.length > 0 || valid.size !== STATIC_TTS_EXPECTED_TARGETS) process.exitCode = 1;
