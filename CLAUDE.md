# OOM Instructions for Claude Code

Read `AGENTS.md` before making changes. Then read, in order:

1. `README.md`
2. `docs/ARCHITECTURE.md`
3. `docs/TRAINING_SYSTEM.md`
4. The relevant `docs/CONTENT_AUTHORING.md`, `docs/TTS_AUDIO_PIPELINE.md`, `docs/ROUTING.md`, or `docs/DEPLOYMENT.md`
5. `docs/PROJECT_SNAPSHOT.md` when file or package-script inventory matters

`AGENTS.md` is the source of truth for constraints, data ownership, navigation rules, TTS asset policy, and validation. Treat `reference/**` and historical audit documents as non-canonical.

Run the required validation commands from `AGENTS.md` before completing work. Run `npm run docs:generate` and `npm run docs:check` whenever documentation structure, source files, or package scripts change.
