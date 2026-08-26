# OOM Project Rule

Before working in this repository, read `AGENTS.md`. It points to the current README, architecture, training system, content authoring, TTS, routing, deployment, and generated project snapshot.

Preserve these repository rules:

- Keep the app static-hosting compatible and do not add server-side dependencies.
- Keep LLM keys and tokens out of code, tests, documentation examples, and commits.
- Keep fixed survey recommendations in `src/data/fixedSurvey.ts`.
- Keep STEP 1-6 under `OPIc 실전 훈련하기`; use `docs/ROUTING.md` before changing a route or sidebar hierarchy.
- Treat `reference/**` and historical audit documents as non-canonical inputs.
- Run the validation and documentation commands required by `AGENTS.md` before completing work.
