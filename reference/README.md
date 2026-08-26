# Reference Packages

Everything under `reference/` is supplied implementation input, a prototype, a design exploration, or a historical integration package. It is **not** the OOM runtime and is not a source of truth for current routes, data ownership, dependencies, or product behavior.

Before using any reference file:

1. read root `AGENTS.md` and the canonical docs under `docs/`;
2. verify the active implementation in `src/App.tsx` and the owning `src/**` module;
3. adapt only the explicitly requested idea;
4. do not import reference applications, package manifests, model assets, or secrets into production by default.

Reference packages may intentionally contain stale paths, alternative architectures, experimental dependencies, benchmark code, or decisions that were not adopted. Git history preserves them if they are later archived or removed. Their retention does not mean they are supported product surfaces.
