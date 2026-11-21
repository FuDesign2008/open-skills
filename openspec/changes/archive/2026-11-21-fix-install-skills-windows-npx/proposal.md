# Proposal

## Why

`scripts/install-skills.mjs` fails at startup on Windows: it runs `spawnSync('npx', …)` with `shell: false`, but on Windows `npx` is a `.cmd` shim that Node cannot launch without a shell (ENOENT; spawning `.cmd` directly is additionally blocked since the CVE-2024-27980 mitigation). The documented install path therefore never reaches the install, verification, prune, or manifest steps on Windows.

## What Changes

- Launch the skills CLI through npm's `npx-cli.js` using `process.execPath`, resolving the CLI entry from the running Node installation (Windows layout `<node dir>/node_modules/npm/bin/npx-cli.js`, POSIX layout `<node dir>/../lib/node_modules/npm/bin/npx-cli.js`), so no shell or `.cmd` shim is involved at the helper's spawn site on any platform.
- Keep POSIX behavior identical; when the CLI entry cannot be resolved, fall back to the current `npx` invocation.
- Preserve every existing contract: CLI flags (`--source`, `--skill`, `--no-prune`), clone/install/PromptScript failure detection, full-install completeness verification, prune attribution, and manifest semantics.
- Add unit tests covering the launcher plan for Windows, POSIX, and the unresolved-entry fallback.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `skill-global-install`: the install helper must start the skills CLI on Windows, not only on POSIX hosts.

## Impact

- `scripts/install-skills.mjs` — launcher wiring only; exported helpers and their contracts are unchanged.
- `scripts/install-skills.test.mjs` — new launcher tests.
- Callers unchanged: `npm run install:skills`, README / `docs/INSTALL.md` / `AGENTS.md` install recipes.
- No new dependencies and no change to global skill directory layout or manifest format.
