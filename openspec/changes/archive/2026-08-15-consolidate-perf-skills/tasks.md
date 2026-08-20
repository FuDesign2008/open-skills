# Tasks — consolidate-perf-skills

## 1. Merge discipline into host

- [x] Rewrite `skills/perf-optimize-workflow/SKILL.md`: frontmatter drops `perf-evidence-discipline` dependency; description adds inherited triggers (「伪影排查」「口径校准」「设备画像」) and fixes the loop wording (environment-gated, not optional); layered-architecture table marks the evidence gate as in-file; per-stage gate lines point to the in-file section; insert the "Evidence validity disciplines" section (nine disciplines, condensed from the discipline SKILL.md, minus the mount table)
- [x] Append the case archive to `skills/perf-optimize-workflow/reference.md` as Part 4 (from `skills/perf-evidence-discipline/reference.md`), update the archive pointer

## 2. Delete and re-point

- [x] Delete `skills/perf-evidence-discipline/` (hard cut)
- [x] Routing edges: one informational line each in `solve-workflow` Stage 1, `opsx-solve-workflow` Stage 1, `jira-fix-workflow` Stage 1 (route performance-domain problems to `perf-optimize-workflow`)
- [x] `AGENTS.md`: remove the perf-evidence-discipline row; restore host dependency column (clarifying-question-discipline、known-issue-research)
- [x] `RELEASE-NOTES.md`: update the unreleased 2.0.0 entry in place (single skill carries paradigm + disciplines + knowledge layer)

## 3. Verification

- [x] `node scripts/gen-skill-docs.mjs` + `git diff --exit-code docs/generated/skills-index.md` (56 skills, consistent)
- [x] `npm run lint:skill-description` (0 errors)
- [x] `node scripts/lint-skill-deidentification.mjs --staged` (no new internal identifiers)
- [x] Content-preservation grep: nine discipline keywords + case-archive markers present in the merged files
- [x] Residual grep: no active-surface references to `perf-evidence-discipline` outside archive/history
- [x] `openspec validate consolidate-perf-skills`

## 4. Closeout

- [x] Archive the change (manual move for the capability deletion; CLI limitation recorded in design.md), delete `openspec/specs/perf-evidence-discipline/`
- [x] Update main spec `perf-optimize-workflow/spec.md` from the delta; fill Purpose
- [ ] Commit on `feat/perf-paradigm-skills` (PR #277 updates automatically)
