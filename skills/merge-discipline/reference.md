# Merge Discipline — Reference

## Pre-merge checklist (gates + tip pinning)

> Full rules live in this skill's `SKILL.md` (Part A archive gate + Part B rebase + Part C coverage + Part R PR code review + Part D tip pinning). This is a pre-merge self-check cheat sheet; referencing workflows must not copy the body — keep a one-line pointer only.

**OpenSpec archive association gate (Part A, first):**
- [ ] Association decided? (diff contains active `openspec/changes/<name>/`, or session-bound name still in `openspec list`) → Part A
- [ ] If associated and still active: merge blocked and same-tip archive required? (no implicit skip straight to merge) → Part A
- [ ] If not associated: proceed to Part B? → Part A

**Rebase pre-check (Part B):**
- [ ] Target-branch lead detected? → Part B
- [ ] Conflicts detected? → Part B
- [ ] When rebase is needed: reported and waiting for user confirm (no auto-rebase)? After rebase + push, this Part ends without waiting on CI? → Part B

**Coverage gate (Part C):**

- [ ] Merge intent confirmed? (branch closeout chose merge / user direct merge command / AI about to invoke merge)
- [ ] Project `coverage-gate` preference resolved? (`AGENTS.md` → `CLAUDE.md`; unset ≡ `ask`)
- [ ] If `ask`: asked user “run / skip for this merge”? (must not auto-run)
- [ ] If **run**: is test-coverage-analyzer available? → if not, write env-gap trail and wait for user
- [ ] If **run**: gate script executed? Result? → pass → Part R; below threshold / crash / no report / no tests → pause for user
- [ ] If **skip** (`never` or user-explicit skip): audit trail written? (not an implicit miss)
- [ ] Implicit miss only means “should-run but did not”

**PR code review (Part R):**

- [ ] Strong dependency `pr-code-review` present? (else abort with per-skill `npx skills add … --skill pr-code-review --yes`)
- [ ] `pr-code-review` run on the open PR/MR tip?
- [ ] Pass (no issues ≥80) → Part D; fail → block (or explicit skip 留痕)

**Merge tip pinning (Part D):**

- [ ] Merge pins the revision? (`gh`: `--match-head-commit` or platform equivalent; bare merge forbidden) → Part D step 1
- [ ] After a fresh push, was “Pipeline succeeded” checked against that sha? → Part D step 2
- [ ] Post-merge ancestor check OK? (MISSING → open backfill MR; do not claim closeout) → Part D step 3
