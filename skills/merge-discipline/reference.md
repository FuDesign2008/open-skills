# Merge Discipline — Reference

## Pre-merge checklist (gates + tip pinning)

> Full rules live in this skill's `SKILL.md` (Part A archive gate + Part B rebase + Part C coverage + Part R PR code review + Part D squash decision & tip pinning). This is a pre-merge self-check cheat sheet; referencing workflows must not copy the body — keep a one-line pointer only.

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

- [ ] Project `pr-review-gate` preference resolved? (`AGENTS.md` → `CLAUDE.md`; unset ≡ `always`)
- [ ] If `ask`: asked full / light / skip? (must not auto-pick)
- [ ] If `non-code-light` (or user chose light): surface classified per「Non-application-code surface」below?
- [ ] If review **run**: strong dependency `pr-code-review` present? (else abort with per-skill `npx skills add … --skill pr-code-review --yes`)
- [ ] If review **run**: `pr-code-review` invoked at selected `depth=full|light` on the open PR/MR tip (Standards∥Spec)?
- [ ] If **skip** (`never` or user-explicit skip): 留痕 written?
- [ ] Pass = neither axis has ≥80 Critical/Important → Part D; else block (or explicit skip 留痕)

**Merge squash decision + tip pinning (Part D):**

- [ ] Squash decision run before the merge command? (commit list + quality recommendation + explicit user choice; no auto-select, direct merge commands included) → Part D step 0
- [ ] Merge pins the revision? (`gh`: `--match-head-commit` or platform equivalent; bare merge forbidden; merge method = Step 0 choice) → Part D step 1
- [ ] After a fresh push, was “Pipeline succeeded” checked against that sha? → Part D step 2
- [ ] Post-merge ancestor check OK? (MISSING → open backfill MR; do not claim closeout) → Part D step 3

---

## Non-application-code surface

Authoritative path classifier for Part R when `pr-review-gate: non-code-light` (or the user chose light under `ask`). Classify the PR/MR **three-dot** changed-path list.

### Allowlist (non-application-code **only if every** changed path matches)

| Pattern | Notes |
|---------|--------|
| `**/*.md` | Including skill bodies, docs, OpenSpec markdown |
| `docs/**` | All documentation trees |
| `skills/**` | Skill packages (Markdown + skill-local assets that are not denylisted below) |
| `openspec/**` | Specs, changes, archive |
| `AGENTS.md`, `CLAUDE.md`, `CONTEXT.md` | Project guidance at repo root (or documented equivalents) |
| `.claude-plugin/**`, `.cursor-plugin/**` | Plugin marketplace / plugin metadata JSON |
| `docs/generated/**` | Generated indexes (e.g. skills-index) |
| Root `package.json` / lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`) | Only when **no** denylisted paths appear in the same PR |

Skill-local non-Markdown under `skills/<name>/` that is documentation/assets only (e.g. `reference.md`, images) is allowlisted via `skills/**` **unless** it matches the denylist (e.g. `skills/**/scripts/**/*.js`).

### Denylist (any match → **application-code** → full depth under `non-code-light`)

| Pattern | Notes |
|---------|--------|
| `hooks/**` | Hook shell/scripts |
| `.opencode/**` | OpenCode plugins (JS/TS) |
| `.github/workflows/**` | CI workflow definitions |
| `scripts/**` | Repo tooling scripts |
| `**/*.{ts,tsx,js,jsx,mjs,cjs,py,go,java,rs,swift,kt}` | Runtime/source extensions **except** when the only matches are under a pure docs tree that does not execute them (conservative default: **any** such extension path forces application-code) |

### Decision

| Condition | Surface |
|-----------|---------|
| ≥1 denylist path | application-code |
| All paths allowlisted, zero denylist | non-application-code |
| Empty diff | Do not classify; Part R eligibility / empty-diff rules in `pr-code-review` apply |
