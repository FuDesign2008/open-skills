## 1. Red contract tests

- [x] 1.1 Add `scripts/human-facing-html-contract.test.mjs` asserting the new sentences in SKILL.md and reference.md: HTML coverage; the `Trigger` header; interactive auto-open vs on-demand; the entry-page link set (`progress.html`, the triage HTML view, each card's HTML view, each executed card's report HTML view, and each done card's review and evidence pages) with unavailable annotations; failed/skipped annotations; renderer escaping/self-containment; the no-Node fallback in `SKILL.md`; deterministic `reports/<card-slug>.md`/`.html` paths and the original-path footer; the exact auto-MR states `MR: opened <url>`, `MR: failed — <reason>`, and `MR: skipped — no reviewable diff (<status output>; <diff output>)`, both scoped commands plus a short output summary, the bounce/failure→`failed` mapping, and the four record locations; and the verification card HTML view path. Negative cases: `config`/`approaches` get no view; the existing review/evidence contract is unchanged; enqueue shells write no view. Run `node --test scripts/human-facing-html-contract.test.mjs` under Node 22 and record the red failure.
- [x] 1.2 Add `skills/goal-driven-queue/scripts/render-html.test.mjs` with failing tests for escaping (`<script>`, `&`, quotes, `<batch-id>`), tables/escaped pipes, lists/checkboxes, fences, blockquotes, link rewriting, footer, self-containment, `<meta charset="utf-8">` and a non-ASCII round-trip, determinism, `.md` byte-unchanged, scheme allowlist (`javascript:`, `data:`, `vbscript:`, `file:`, `//host`, leading `/`, backslash, `JaVaScRiPt:`, `java\tscript:`), path containment, local-vs-external images, `--source-label` footer, and an injected opener. Run under Node 22 and record the red failure.

## 2. Renderer

- [x] 2.1 Implement the block/inline parsers, escaping, link normalization/rewriting, image handling, self-contained CSS, UTF-8 shell, and footer in `skills/goal-driven-queue/scripts/render-html.mjs`; run `node --check` and the parser tests until green under Node 22.
- [x] 2.2 Implement the CLI (`--root`, `--open`, `--at`, `--source-label`), atomic file write, and open action (argument vector, platform handler, print-path on failure); run the remaining renderer tests until green.
- [x] 2.3 Packaging fixture (G3): render a task card, triage record, progress, verification, a copied engine report, and a done card with review/evidence pages in a temp queue directory; assert the full entry-page link set, the expected `.html` set, `reports/<card-slug>.md`/`.html`, zero missing targets, failed/skipped/zero-done annotations, and byte-unchanged `.md` sources.

## 3. Skill body and templates

- [x] 3.1 Add the human-facing HTML section, the `Trigger` rule, interactive auto-open vs on-demand, and the no-Node fallback to `skills/goal-driven-queue/SKILL.md`; update Stage 1 and Stage 3; re-run the contract test until the skill assertions pass.
- [x] 3.2 Add the auto-MR card-supply rule, the three exact `MR:` states, both scoped diff commands with a short output summary, the bounce/failure→`failed` mapping, and the four record locations to `SKILL.md`; replace the "referenced by path" engine-report sentence with the deterministic copy paths; re-run the contract test.
- [x] 3.3 Update `skills/goal-driven-queue/reference.md`: coverage/renderer section, progress batch header `Trigger` line and `MR` field, the per-branch `MR` field in the batch summary, verification `MR` line and card HTML view path, and the verification entry-page link block with unavailable annotations; re-run the contract test until the reference assertions pass.

## 4. Regression and reconciliation

- [x] 4.1 Run `node --test scripts/review-html-flow-contract.test.mjs` and confirm it passes unchanged; confirm `config`/`approaches` get no view and enqueue shells write none.
- [x] 4.2 Reconcile the acceptance-package auto-rebase wording with open-MR branches (scratch worktree only, no push/rewrite); confirm the delta and skill text agree.

## 5. Gates and version

- [x] 5.1 Bump the skill version `0.16.0` → `0.17.0`; run `node scripts/lint-skill-description.mjs` and confirm the description is ≤950 chars and single-line (do not edit it).
- [x] 5.2 Run `node scripts/gen-skill-docs.mjs`, stage the regenerated index, and re-run the generator after staging; confirm `git diff --exit-code docs/generated/skills-index.md` is clean.

## 6. Integration verification

- [x] 6.1 Switch to Node 22 (`nvm use 22`), record `node -v`, run `npm test` (both new test files must appear in the output) and `openspec validate 2026-10-26-human-facing-html-and-auto-open --strict`; record both outputs.
- [x] 6.2 Run the packaging fixture/link-resolution check; record zero missing targets and byte-unchanged `.md` sources.
- [x] 6.3 Run an explicit real-open invocation on a fixture and capture a non-empty screenshot; run a scheduled-path harness (a command that calls the renderer/open helper with `Trigger: scheduled` and asserts no opener is invoked) and record both evidence items (G4).
- [x] 6.4 Run `node scripts/lint-skill-deidentification.mjs --base origin/main`; confirm no new findings; confirm `git diff origin/main -- package.json` is empty (dependencies unchanged) and the diff excludes `.goal-driven/`.

## 7. Archive and delivery

- [x] 7.1 Archive the change via `openspec-archive-change`; confirm the main-spec update and archive move; run `openspec validate goal-queue --strict`.
- [ ] 7.2 `git fetch origin main`; confirm `origin/main...HEAD` is even; stage only `skills/goal-driven-queue/SKILL.md`, `skills/goal-driven-queue/reference.md`, `skills/goal-driven-queue/scripts/render-html.mjs`, `skills/goal-driven-queue/scripts/render-html.test.mjs`, `scripts/human-facing-html-contract.test.mjs`, `docs/generated/skills-index.md`, the archived change directory, and `openspec/specs/goal-queue/spec.md` (never `git add -A`); commit and push with `git push -u origin feat/human-facing-html-and-auto-open`; open the MR automatically and record `MR: opened <url>` with both scoped diff commands and a short output summary; confirm the diff contains no queue artifacts.
