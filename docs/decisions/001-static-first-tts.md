# ADR 001: Static-first TTS for Fixed Training Content

- Status: Accepted
- Date: 2026-08-25

## Context

OOM needs consistent English voices, immediate playback, and a real waveform in STEP 3~6.

Browser Web Speech can start quickly because the operating system/browser already provides the voice. The voice varies by environment, and the API is a poor fit for repository-controlled audio files, exact duration, and precomputed waveform data.

Kokoro browser inference provides the same selected voice and a real audio Blob. Long q8/WASM synthesis was slower than real time. WebGPU was substantially faster in an isolated run, but a noticeable Play wait remained and WebGPU streaming was not measured as production-ready.

The current training corpus is enumerable from the Course registry, Level registry, roleplays, questions, and fixed preview phrases. It can be generated before deployment.

## Decision

- Pre-generate fixed playable content with Kokoro.
- Support exactly Heart, Bella, Sarah, and Sky.
- Synthesize at 1.00×.
- Encode mono WebM with Opus and store precomputed PCM-derived waveform peaks.
- Resolve static assets first through a content-hashed production manifest.
- On a static miss or media failure, use the lazy browser Kokoro runtime.
- If Kokoro fails, use system Web Speech as the final immediate fallback.
- Keep STEP 4/5 speed as client player `playbackRate`; do not create rate-specific assets.

## Consequences

Positive:

- fixed content starts without model inference;
- voices are consistent across supported browsers;
- WaveSurfer can show the actual waveform;
- static assets are cacheable and do not occupy runtime IndexedDB;
- changed text creates a new hash while unchanged targets are skipped.

Costs:

- generated binary assets, peaks, inventory, and manifest must be versioned together;
- repository and Pages artifacts grow as Courses grow;
- every changed TTS-covered text requires audit, incremental generation, and validation;
- dynamic AI/user text still needs a runtime or server path.

## Benchmark Evidence

The decision used one 968-character Bella script at synthesis 1.00× as a configuration-specific sanity check. q8/WASM took about 112 seconds total; q8 streaming reached first audio in about 16.5 seconds but underrun repeatedly; isolated fp32/WebGPU took about 18.5 seconds total. WebGPU streaming was not measured.

These numbers justify pre-generation for the current corpus. They are not a universal performance claim and are not copied into a large permanent benchmark table.

## Future

- Dynamic AI text may use system Web Speech for immediate UX, browser Kokoro where acceptable, or a future GPU/server TTS endpoint.
- An intranet/backend may serve or generate audio, but fixed content can remain static-first.
- A future runtime-default change requires new reproducible measurements, including streaming behavior and target-device coverage.
