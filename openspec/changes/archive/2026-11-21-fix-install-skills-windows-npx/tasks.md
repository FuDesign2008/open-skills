# Tasks

## 1. Launcher seam (test-first)

- [x] 1.1 Add failing unit tests for the exported `resolveNpxLaunch({ execPath, platform, fileExists })` seam in `scripts/install-skills.test.mjs` (missing export must import-fail); verify `node --test scripts/install-skills.test.mjs` is red for the new cases
- [x] 1.2 Implement `resolveNpxLaunch` with the two candidate layouts (`<execDir>/node_modules/npm/bin/npx-cli.js`, `<execDir>/../lib/node_modules/npm/bin/npx-cli.js`, platform-parameterized, injectable `fileExists`) and the `npx` fallback; verify the new tests pass on Win32 and POSIX parameterizations
- [x] 1.3 Add a test proving a `--source` value containing spaces survives as one argv entry in the returned plan; verify it passes and existing 8 tests stay green

## 2. Spawn wiring and diagnostics

- [x] 2.1 Replace the `spawnSync('npx', …)` call in `main()` with a spawn driven by the resolved plan (`process.execPath` + `npx-cli.js`, `shell: false`) while keeping the `result` shape unchanged; verify `node --test scripts/install-skills.test.mjs` passes
- [x] 2.2 Add the Windows fallback diagnostic (pure exported helper returning the hint when `via === 'npx-fallback'` on win32) and its unit test; verify the hint test passes and the failure path still exits non-zero
- [x] 2.3 Print the actual launch plan in the progress line and help text (command + `via`); verify by running the script with an unresolvable entry/fallback guard or a unit test of the formatter that the printed line reflects the plan, not a hardcoded `npx`

## 3. Documentation

- [x] 3.1 Update `docs/INSTALL.md` wording where it states the helper executes `npx skills add` so it matches the new launch path; verify the documented command and description agree with the implementation

## 4. Integration verification

- [x] 4.1 Run the real Windows end-to-end install `node scripts/install-skills.mjs --source .` and verify exit 0 with all 70 skills installed (manifest updated, no clone/PromptScript failure signals)
- [x] 4.2 Run the space-containing source case (`--source` pointing at a directory whose path contains spaces) and verify the install completes without argument splitting
- [x] 4.3 Run `node --test` repo-wide and `openspec validate --strict` on this change; verify the change's tests pass, the repo-wide failures equal the pre-existing baseline (6 platform failures, 47 strict-warning spec failures), and the change validation is green

## Workflow follow-up

- Archive the change after verification passes and the user confirms archiving.
- Delivery: commit, open PR, and merge per the repo's merge discipline once the user approves.
