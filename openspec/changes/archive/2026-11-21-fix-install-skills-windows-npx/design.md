# Design — fix-install-skills-windows-npx

Stage: design (staged review complete; see Review record). Status: **PASS — R1/R2 applied by the host and re-verified by leader re-review of the corrected primary text; [Standards] and [Spec] axes both green.** Implementation may proceed per the decisions below; verify-phase obligations are listed in Test strategy.

## Context

`scripts/install-skills.mjs:250` calls `spawnSync('npx', args, { shell: false })`. On Windows `npx` is a `.cmd` shim that Node cannot launch without a shell (ENOENT; direct `.cmd` spawning is additionally blocked since the CVE-2024-27980 mitigation). Reproduced on Node v22.23.4 / Windows: `node scripts/install-skills.mjs --source .` exits 1 before reaching install, verification, prune, or manifest steps.

User-selected solution: resolve npm's `npx-cli.js` from the running Node installation and launch it with `process.execPath`; fall back to the historical `npx` invocation when unresolvable. No shell at the helper's spawn site. This is the shim's own mechanism (`npx.cmd` runs `"%NODE_EXE%" "%NPX_CLI_JS%" %*`), not a workaround.

## Goals

- Start the skills CLI on Windows without a `.cmd` shim at the helper's spawn site; the documented install path works end to end on Windows.
- Keep POSIX install outcomes, flags, and failure detection identical.
- Preserve every existing contract: `--source` / `--skill` / `--no-prune`, clone/install and PromptScript failure detection, full-install completeness verification, prune attribution, manifest semantics.
- Arguments (including paths with spaces) reach the skills CLI as discrete argv entries, never re-tokenized by the helper.
- Unit-testable launcher plan covering Windows-resolved, POSIX-resolved, and unresolved-fallback cases on any CI platform.

## Non-goals

- No new npm dependencies (node builtins only).
- No change to exported helper contracts, global skill directory layout, or manifest format.
- No change to npm's own internals: `npm exec` internally spawns the target bin via `cmd.exe` on Windows (`libnpmexec/lib/index.js:97`, npm 10.9.9). That is npm-supported, does not reintroduce the helper-level ENOENT, and is out of scope.
- No retry-on-broken-entry behavior: fallback fires only when the CLI entry cannot be resolved (per delta).
- Adding a Windows CI job is a recommended follow-up, not part of this change (see Open questions).

## Decisions

- **D1 — Pure exported launcher-plan seam.** Add `resolveNpxLaunch({ execPath, platform, fileExists })` returning `{ command, args, via }` (`via: 'node-npx-cli' | 'npx-fallback'`). Candidate paths are constructed with `path.win32` / `path.posix` selected by the `platform` parameter, and existence is checked through the injectable `fileExists`, so Windows-layout cases are testable on the ubuntu-only CI without spawning processes or mocking `child_process`. Fits the existing pure-helper test pattern (`scripts/install-skills.test.mjs`); `main()` stays unexported.
- **D2 — Two candidate layouts, first existing wins.**
  1. `<dirname(execPath)>/node_modules/npm/bin/npx-cli.js` — Windows MSI/zip, nvm-windows, fnm, scoop (verified present on this fnm-Windows host).
  2. `<dirname(execPath)>/../lib/node_modules/npm/bin/npx-cli.js` — common POSIX layouts (nvm / NodeSource / asdf / Volta).
  Neither resolves → historical `spawnSync('npx', args, { shell: false })` fallback.
- **D3 — Spawn wiring only.** On resolution: `spawnSync(process.execPath, [npxCliPath, ...cliArgs], { encoding: 'utf8', shell: false, env: process.env })`. The `result` shape (`stdout`/`stderr`/`status`/`error`) is unchanged, so failure detection (lines 256–284), completeness verification (292–303), and prune/manifest (307–321) need no edits. `npx-cli.js` forwards argv as discrete entries (rewrites `argv[1]` to `npm-cli.js`, splices `'exec'`, inserts `--` before the first positional) — identical semantics to the historical shim; spaced paths round-trip verbatim (verified).
- **D4 — Fallback diagnostics.** The fallback preserves the existing launch-failure contract (`result.error` → print + exit 1). On Windows an unresolved entry reproduces the original ENOENT; add a targeted hint (bundled npm not found next to the Node binary; `npx` is a `.cmd` shim) so a wrong resolution is diagnosable instead of silently reproducing the bug.
- **D5 — Accurate launch logging.** Replace the hardcoded `→ npx …` progress line (line 249) and the help text `Runs: npx skills add …` (line 205) with the actual plan (`via` + command), keeping the failure point diagnosable.

## Risks and mitigations

| Risk | Level | Mitigation |
|---|---|---|
| Non-standard Windows npm prefix → neither candidate resolves → ENOENT persists via fallback | medium | D2 covers mainstream layouts; D4 diagnostic; end-to-end Windows run with a space-containing `--source` at implement/verify |
| Target platform never exercised by CI (`tests.yml` is ubuntu-latest only) | medium | D1 platform-parameterized pure tests cover Windows logic on Linux; Windows CI job recommended as follow-up |
| Bundled npm chosen over a newer npm on PATH (POSIX resolution now succeeds) | low | Outcome identical; both are npm-supported launch paths |
| Entry exists but is broken (no retry per delta) | low | Existing `result.error`/status handling still exits non-zero; accepted residual |
| Reversibility | — | Two-way door: one production file + tests, revertable; standard review depth appropriate |

## Test strategy (test-first)

1. Red: add tests importing `resolveNpxLaunch` from `scripts/install-skills.mjs` (missing export → observable failure). Cases: win32 execDir-layout resolved; posix `../lib`-layout resolved; posix unresolved → `npx-fallback`; win32 unresolved → `npx-fallback`; plan args keep a spaced `--source` value as one entry.
2. Green: minimal D1–D3 implementation; existing 8 tests stay green (`node --test scripts/install-skills.test.mjs`, baseline 8 pass / 0 fail).
3. Implement/verify phase: real Windows run `node scripts/install-skills.mjs --source .` (and a space-containing source path) to close the delta's end-to-end scenario — not executed during design review (network install / npm cache writes).
4. Baseline note: repo-wide `node --test` has 6 pre-existing platform failures unrelated to install-skills (renderer path separators / byte baselines), identical on the primary checkout.

## Spec-delta corrections (RESOLVED — applied by host, re-verified by leader)

- **R1 (was high, blocking) — RESOLVED.** The "Unresolved entry falls back" scenario (delta lines 19-24) now reads: WHEN the entry cannot be resolved → THEN fall back to the `npx` invocation at the helper's own spawn site; AND WHEN that fallback also fails to launch → THEN print the launch failure and exit non-zero. The failure claim is conditional, so it no longer contradicts the "POSIX behavior unchanged" scenario (POSIX `npx` succeeds), and it matches the existing `result.error` → print + exit 1 path (`scripts/install-skills.mjs:281-284`).
- **R2 (was medium) — RESOLVED.** The first requirement's last sentence (delta line 7) is now scoped: "At the helper's own spawn site, the helper MUST NOT invoke a `.cmd`/`.bat` shim and MUST NOT route its spawn through a shell." This is verifiable at the helper level and makes no claim about `npm exec` internals (`libnpmexec/lib/index.js:97` cmd.exe usage remains npm-supported and out of scope). Proposal line 9 carries the same scoping and now enumerates both candidate layouts (matches D2).
- Re-verification: leader read both corrected artifacts in full (host instruction: do not trust the summary); reverse-grep for the changed wording across `openspec/` found no main-spec or cross-change references needing sync; `git diff --stat -- scripts/` empty (host edits artifacts-only). No new contradiction introduced.
- Format note (low): `openspec` CLI is unavailable in this review environment (not in local `.bin`, node dir, or global), so `openspec validate fix-install-skills-windows-npx --strict` was not run here. The scenario's `**AND WHEN**` continuation follows the repo's archived validated convention (`**AND**` / `**AND** THEN` bullets) and the required `WHEN`/`THEN` pair is present; run strict validation at the verify/archive stage where the CLI is available.

## Open questions

- Add a Windows job to `.github/workflows/tests.yml` (follow-up change, or fold into this one)? Recommendation: follow-up; D1 already makes the launcher logic cross-platform testable.
- Should the POSIX scenario explicitly acknowledge the bundled-vs-PATH npm selection nuance? Recommendation: no wording change needed; outcomes are identical.

## Review record (design stage, dual axis)

- `solution-review` (core + strategic, reversible/standard depth, standard tier): **[Standards] PASS / [Spec] FAIL** — R1 blocking scenario contradiction; R2 overbroad requirement; medium findings: enumerate both candidate layouts (adopted as D2), platform-parameterized test seam for ubuntu-only CI (adopted as D1); low: accurate logging (D5), Windows fallback diagnostic (D4). Strategic: two-way door; FMEA no unmitigated high×high; cost-vs-value strongly favorable; cognitive fit low.
- `code-design-review` (Layers A/B/C, standard tier): **PASS**, high confidence — Layer A testability/modularity/reliability/dependency-direction green; Layer B data coupling only, cyclomatic ≈3–4, no change amplification; Layer C security improves (removes PATH-hijack lookup CWE-426, avoids `.cmd` shim CVE-2024-27980/BatBadBut); keep `shell: false` explicit. Non-blocking notes folded into D1/D2/D5.
- Leader acceptance (round 1): both cards fail-closed-checked; blocking R1 and the npm-internals evidence spot-verified against primary sources (delta text; `libnpmexec/lib/index.js:97`; `npx-cli.js` argv forwarding; `tests.yml:10,19`). Round-1 verdict: FAIL pending R1/R2 delta corrections.
- Re-review (round 2, leader-performed per host instruction after host applied R1/R2 and the layout enumeration): corrected delta + proposal read in full; R1/R2 confirmed resolved; no new contradiction (first-requirement goal sentence consistent with the scoped operative sentence; verbatim-argument requirement's observable THEN satisfiable via discrete argv forwarding; Windows/POSIX/fallback scenarios mutually consistent and consistent with D1-D5). The nested solution-review [Spec] FAIL is superseded; its medium standards findings were already adopted as D1/D2/D4/D5. Final design-stage verdict: **[Standards] PASS / [Spec] PASS — overall PASS**. Verify-phase obligations remain: real Windows end-to-end run (Test strategy step 3) and `openspec validate --strict` where the CLI is available; Windows CI job is a recommended follow-up (Open questions).