# OOM Deployment

## Current Target

OOM is deployed as the static `dist/` directory. The canonical public origin is `https://opic-on-me.com`, and `vite.config.ts` uses `base: "/"` because the custom domain serves the app from its root.

There is no server runtime. A correct deployment must include:

- Vite JavaScript/CSS assets;
- canonical route-specific HTML;
- `CNAME`, `robots.txt`, `sitemap.xml`, `ads.txt`, and `404.html` where applicable;
- generated TTS WebM files, peaks, and production manifest.

## Build

```bash
npm ci
npm run lint
npm run docs:check
npm run test
npm run build
npm run verify:pages
```

`npm run build` performs TypeScript build, Vite build, then `scripts/generate-static-routes.mjs`.

```text
source `index.html`
→ Vite bundle and copy `public/`
→ built `dist/index.html`
→ route generator writes `dist/**/index.html`
→ route-specific metadata + crawler-visible body
→ generated `dist/sitemap.xml`
```

GitHub Pages cannot rewrite arbitrary SPA paths. The generated route files make direct requests such as `/training/`, `/about/`, and `/practice/` return real built HTML. Only unknown paths use `public/404.html` to return through the SPA fallback.

Do not add redirect-only source placeholders under `public/<route>/index.html`. The post-build route generator is the source for canonical route artifacts, and `npm run verify:pages` rejects redirect-only HTML in `dist/`.

## GitHub Actions

`.github/workflows/pages.yml` is the only Pages deployment workflow. It runs for pushes to `main` and `feature/adsense`, and through manual `workflow_dispatch`.

The build job currently:

1. checks out the repository;
2. sets up Node 24 and npm cache;
3. configures Pages;
4. runs `npm ci`;
5. runs lint and generated documentation check;
6. runs tests;
7. builds the app;
8. verifies the Pages artifact;
9. uploads `dist/`.

The deploy job publishes that uploaded artifact through the official Pages action. Repository Settings > Pages must use **GitHub Actions** as the source. Branch-folder deployment is not the supported path.

CI intentionally does not synthesize TTS. Audio generation requires local browser interaction, Kokoro inference, and FFmpeg. CI consumes the committed runtime assets. `tts:validate` remains a developer/content-release check because it performs hundreds of media probes and depends on FFmpeg availability; a future CI addition should explicitly provision and measure that dependency first.

## Canonical Routes and BASE_URL

Public canonical routes use trailing slashes. `src/lib/routes.ts`, `scripts/generate-static-routes.mjs`, and `docs/ROUTING.md` must remain synchronized.

`src/lib/tts/staticTts.ts` builds static asset URLs from `import.meta.env.BASE_URL`, so the resolver remains base-safe. Current production `base` is `/`. A future GitHub project subpath deployment must intentionally change Vite base, canonical origin/path generation, 404 redirect paths, and validation expectations together; changing only one setting is insufficient.

## Static TTS in the Artifact

Vite copies `public/generated-tts/` into `dist/generated-tts/`:

```text
dist/generated-tts/
├─ tts-manifest.json
└─ audio/<textHash>/
   ├─ heart.webm + heart.peaks.json
   ├─ bella.webm + bella.peaks.json
   ├─ sarah.webm + sarah.peaks.json
   └─ sky.webm + sky.peaks.json
```

The production manifest and content-hashed assets are versioned together. Large binaries increase repository clone size and deployment upload time, so new Course content must use the inventory estimate and incremental generation. Do not add raw WAV intermediates.

## Manual Release Check

Before an explicitly requested commit/push or deployment:

```bash
git status
git diff --stat
npm run lint
npm run test
npm run build
npm run verify:pages
npm run docs:generate
npm run docs:check
npm run tts:validate -- --prune-dry-run
git diff --check
```

Inspect the exact staged file list before committing. For a content release, ensure `artifacts/tts-inventory.json`, new audio/peaks, and `tts-manifest.json` agree. Do not commit or push unless explicitly requested.

## Future Intranet / Backend

An intranet deployment can serve the same `dist/` from an internal static host. A future backend may add authentication, server-side STT/AI, logging, or dynamic TTS. Define those APIs and secret boundaries before implementation.

Fixed content does not need a backend migration. Static-first TTS can remain in the same build or move to an internal object store/CDN while preserving the manifest contract. Dynamic AI text can separately use browser fallback or a future GPU/server TTS service.
