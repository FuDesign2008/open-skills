# Tasks — add-perf-optimize-workflow

## 1. Skill authoring (skill-creator flow)

- [x] Capture intent (this change's proposal; source: two-campaign paradigm + nine-discipline handoff)
- [x] Draft `skills/perf-evidence-discipline/SKILL.md` (nine disciplines, mount table, gate rule) + `reference.md` (anonymized case archive + generic detection toolkit)
- [x] Draft `skills/perf-optimize-workflow/SKILL.md` (six-stage paradigm, harness contract, A/B judge, loop integration) + `reference.md` (Part 1 quick reference, Part 2 detailed, Part 3 extension slots)
- [x] Frontmatter check: name/dir match, version 1.0.0, single-line double-quoted description ≤1024, Chinese triggers present, dependency direction host→discipline

## 2. Migration

- [x] Delete `skills/perf-workflow/` and `skills/frontend-perf/` (hard cut)
- [x] Re-point `commands/perf.md` to `perf-optimize-workflow`
- [x] Update `AGENTS.md` (编排入口 row + skill inventory two rows)
- [x] Update boundary mentions: `solve-workflow`, `write-workflow`, `known-issue-research` ×2, `browser-debug-toolkit` ×2
- [x] Update `docs/SKILL_DISTRIBUTION.md`
- [x] Prepend RELEASE-NOTES 2.0.0 BREAKING entry with migration guidance

## 3. Verification

- [x] Regenerate `docs/generated/skills-index.md` (`node scripts/gen-skill-docs.mjs`)
- [x] `npm run lint:skill-description` passes (both new skills ≤1024)
- [x] Deid gate on staged additions (`node scripts/lint-skill-deidentification.mjs --staged`) — zero new internal identifiers
- [x] Residual grep: no active references to `perf-workflow`/`frontend-perf` outside archives, generated-index history, and the untracked handoff doc
- [x] Deletion-side diff review of the 981-line integration (frontend-perf → reference.md mapping)
- [x] Contract-identifier grep: mount-point stage names consistent on both sides (host stages ↔ discipline mount table)

## 4. Sediment

- [x] OpenSpec change artifacts (this directory)
- [x] Trigger eval set + static checklist in `skills/perf-optimize-workflow-workspace/iteration-1/`
- [x] Commit on feature branch with BREAKING CHANGE footer; PR (no merge without user)
