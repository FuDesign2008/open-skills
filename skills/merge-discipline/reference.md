# Merge Discipline — Reference

## Pre-merge checklist (gates + tip pinning)

> Full rules live in this skill's `SKILL.md` (Part A archive gate + Part B rebase + Part R PR code review + Part C coverage + tip check + Part D squash decision & tip pinning). This is a pre-merge self-check cheat sheet; referencing workflows must not copy the body — keep a one-line pointer only.

**Merge decision sheet (before Part A):**
- [ ] Preflight ran read-only (see「Merge decision sheet」below)? All pending preferences asked in **one** batch with Recommended + rationale, or sheet empty and conclusions stated?
- [ ] Execution consumes sheet answers (no re-ask of answered items)? Mid-flight failures still paused separately?

**OpenSpec archive association gate (Part A, first):**
- [ ] Association decided? (diff contains active `openspec/changes/<name>/`, or session-bound name still in `openspec list`) → Part A
- [ ] If associated and still active: merge blocked and same-tip archive required? (no implicit skip straight to merge) → Part A
- [ ] If not associated: proceed to Part B? → Part A

**Rebase pre-check (Part B):**
- [ ] Target-branch lead detected? → Part B
- [ ] Conflicts detected? → Part B
- [ ] When rebase is needed: reported and the sheet's Rebase item confirmed (no auto-rebase)? After rebase + push, the same attempt continues Part R → Part C → Part D without waiting on CI? A later CI-wait merge starts again from Part A? → Part B

**PR code review (Part R):**

- [ ] Project `pr-review-gate` preference resolved? (`AGENTS.md` → `CLAUDE.md`; unset ≡ `auto`)
- [ ] If `ask`: sheet's Review item answered full / light / skip? (must not auto-pick)
- [ ] If `non-code-light` (or user chose light): surface classified per「Non-application-code surface」below? Application-code also runs the size/risk ladder?
- [ ] If `auto` (or unset) **or** `non-code-light` on application-code: scale/risk/sensitive escalation applied per「Content-matched depth ladder」below?
- [ ] If review **run**: strong dependency `pr-code-review` present? (else abort with per-skill `npx skills add … --skill pr-code-review --yes`)
- [ ] If review **run**: `pr-code-review` invoked at selected `depth=full|light` on the open PR/MR tip (Standards∥Spec)?
- [ ] Every satisfaction exit (clean pass, user skip, accept-residual, `never`) wrote 留痕 including `tip=<full sha of origin/<source> at exit>`? Clean pass uses `【PR code-review 门控通过】tip=<sha>。时间：<ISO>。PR：<id>。depth=<light|full>。`
- [ ] Pass = neither axis has ≥80 Critical/Important → Part C
- [ ] On fail: source-tip fixes alone do **not** unlock Part C — mandatory re-run Part R on the new tip until clean, or explicit skip / accept-residual 留痕
- [ ] Fail→fix→re-review rounds counted (each `pr-code-review` = 1)? Cap 3 then pause (continue one round / accept residual / abort) — no auto Part C

**Coverage gate (Part C):**

- [ ] Merge intent confirmed? (branch closeout chose merge / user direct merge command / AI about to invoke merge)
- [ ] Project `coverage-gate` preference resolved? (`AGENTS.md` → `CLAUDE.md`; unset ≡ `ask`, not `auto`)
- [ ] If `ask`: sheet's Coverage item answered “run / skip for this merge”? (must not auto-run)
- [ ] If `auto`: four-cell in「Coverage auto four-cell」applied (surface + ladder without post-fail re-entry)? Classify or command failure → run?
- [ ] If **run**: is test-coverage-analyzer available? → if not, write env-gap trail and wait for user
- [ ] If **run**: gate script executed read-only? Result? → pass → tip check then Part D; below threshold / crash / no report / no tests → pause for user
- [ ] If **skip** (`never`, user-explicit skip, or auto-skip): audit trail written? (not an implicit miss). Auto-skip records surface, lines, files, and flags
- [ ] Implicit miss only means “should-run but did not” (includes `auto` when the cell says run)

**Tip check (after Part C continues, before Part D):**

- [ ] Latest Part R satisfaction 留痕 contains `tip=`?
- [ ] `git fetch origin <source>` done, and `T_trace`, `T_tracking` (`origin/<source>`), `T_pr` (platform head), and `T_local` (when `refs/heads/<source>` exists) all equal `T_trace`?
- [ ] Mismatch or missing `tip=` → do not enter Part D; new merge attempt from Part A?
- [ ] Match → Part D pins `T_trace`?

**Merge squash decision + tip pinning (Part D):**

- [ ] Squash decision resolved before the merge command? (commit list + quality recommendation + explicit user choice from the sheet, or collapse conclusion; no auto-select, direct merge commands included) → Part D step 0
- [ ] Merge pins the revision? (`gh`: `--match-head-commit` or platform equivalent; bare merge forbidden; merge method = Step 0 choice) → Part D step 1
- [ ] After a fresh push, was “Pipeline succeeded” checked against that sha? → Part D step 2
- [ ] Post-merge ancestor check OK? (MISSING → open backfill MR; do not claim closeout) → Part D step 3

---

## Merge decision sheet

Authoritative template and preflight checklist for the sheet described in `SKILL.md`「Merge decision sheet」. The sheet is exempt from `clarifying-question-discipline` one-question-per-turn (merge gates, not a clarify interview).

### Preflight checklist (read-only — each line is a verifiable fact)

| Part | Detect | Command / source | Sheet item if… |
|---|---|---|---|
| A | Active association | PR diff paths under `openspec/changes/<name>/` (not `archive/`); `openspec list --json` | associated and still active → **Archive** |
| B | `BEHIND`, `CONFLICTS` | `git fetch origin <target>`; `git rev-list --count HEAD..origin/<target>`; `git merge-tree` (see Part B) | `BEHIND>0` or `CONFLICTS>0` → **Rebase** |
| C | `coverage-gate` | `AGENTS.md` then `CLAUDE.md` | `ask` / unset → **Coverage**. `auto` is not a sheet item |
| R | `pr-review-gate` | `AGENTS.md` then `CLAUDE.md`; for the Recommended depth also surface + escalation (sections below) | `ask` → **Review** |
| D | Commits, collapse | `gh pr view <id> --json commits` / `glab mr commits <id>`; permitted merge methods | ≥2 commits and no collapse → **Squash** |
| — | Delete branch | — | any other item present → optional **Delete** |

### Template

Render as one structured batch form (agent's native capability) or, when none is available, as this numbered prose list. Keep only the items whose "Included when" holds.

```
Merge decision sheet — <source-branch> → <target-branch> (PR/MR <id>)
Preflight: <one-line facts, e.g. BEHIND=3 CONFLICTS=0; 4 commits; coverage-gate=unset; pr-review-gate=ask>

1. Archive — active change <name> is on this tip
   A. Archive on the same tip first   B. Skip with explicit 留痕
   Recommended: A (merge-then-archive leaves specs off the target)
2. Rebase — target is <N> commits ahead, <M> files may conflict
   A. Rebase now   B. Proceed without rebase (only if CONFLICTS=0)   C. Abort
   Recommended: A (avoids a platform mergeable=false or a tip behind the target)
3. Coverage — coverage-gate is unset
   A. Run   B. Skip (writes skip 留痕)
   Recommended: <A|B> (<one-line rationale>)
4. Review — pr-review-gate is ask
   A. Full   B. Light   C. Skip (writes skip 留痕)
   Recommended: <ladder result> (<surface / escalation one-liner>)
5. Squash — <n> commits: <quality summary>
   A. No-squash (merge commit)   B. Squash
   Recommended: <A|B> (<commit-quality rationale>)
6. Delete source branch after merge (optional)
   A. Delete local + remote   B. Keep
   Recommended: <B if the branch will keep receiving development, else A>

Reply with letters per item (e.g. "1A 2A 3B 4B 5A 6B") or "all recommended".
```

After the reply, state the resolved answers in one line, then execute A→B→R→C→D without re-asking them.

### Empty-sheet statement

When no item is needed, print one line instead of a form, e.g. `Merge decision: no archive association; BEHIND=0; coverage-gate=never; pr-review-gate=auto; single commit → no-squash. Proceeding.`

### Still pauses separately (not sheet items)

Part R fail / 3-round cap; coverage below threshold, crash, no report, no tests; analyzer unavailable after a run decision; rebase conflict that cannot be finished or user abort; tip-check mismatch before Part D; ancestor check MISSING; fast-forward blocked in the workspace sync.

---

## Non-application-code surface

Authoritative path classifier for Part R when `pr-review-gate: non-code-light`, `auto`, or unset (or the user chose light under `ask`). Classify the PR/MR **three-dot** changed-path list.

### Allowlist (non-application-code **only if every** changed path matches)

| Pattern | Notes |
|---------|--------|
| `**/*.md` | Including skill bodies, docs, OpenSpec markdown |
| `docs/**` | All documentation trees |
| `skills/**` | Skill packages (Markdown + skill-local assets that are not denylisted below) |
| `openspec/**` | Specs, changes, archive |
| `AGENTS.md`, `CLAUDE.md`, `CONTEXT.md` | Project guidance at repo root (or documented equivalents) |
| `docs/generated/**` | Generated indexes (e.g. skills-index) |
| Root `package.json` / lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`) | Only when **no** denylisted paths appear in the same PR |

Skill-local non-Markdown under `skills/<name>/` that is documentation/assets only (e.g. `reference.md`, images) is allowlisted via `skills/**` **unless** it matches the denylist (e.g. `skills/**/scripts/**/*.js`).

### Denylist (any match → **application-code**)

| Pattern | Notes |
|---------|--------|
| `.github/workflows/**` | CI workflow definitions |
| `scripts/**` | Repo tooling scripts |
| `**/*.{ts,tsx,js,jsx,mjs,cjs,py,go,java,rs,swift,kt}` | Runtime/source extensions **except** when the only matches are under a pure docs tree that does not execute them (conservative default: **any** such extension path forces application-code) |

### Decision

| Condition | Surface |
|-----------|---------|
| ≥1 denylist path | application-code |
| All paths allowlisted, zero denylist | non-application-code |
| Empty diff / changed-paths=0 with a successful classify command | Empty paths. Part R follows `pr-code-review` empty-diff rules. Part C `auto` uses the empty cell in「Coverage auto four-cell」 |

## Coverage auto four-cell

Used only by Part C when `coverage-gate: auto`. Same surface table as above. Scale/risk uses「Content-matched depth ladder」steps 2, 3, and 5 only. Step 4 (post-fail re-entry) is a Part R depth signal and is not a coverage hit.

| Surface | Scale/risk hit | Action |
|---|---|---|
| non-application-code, or empty paths (`changed-paths=0` and classify succeeded) | no | auto-skip 留痕 (surface, lines, files, large/breaking/sensitive flags) |
| non-application-code or empty paths | yes | run analyzer |
| application-code | no or yes | run analyzer |
| Classify command failed, or changed-path listing failed | — | run analyzer |

## Content-matched depth ladder (auto / unset / non-code-light application-code)

Applied in order; **first escalation hit wins**. For `auto` / unset, start at step 1. For `non-code-light` + application-code, start at step 2 (surface is already application-code; skip forcing `full` at step 1). For `non-code-light` + non-application-code, do not use this ladder (`light`).

| Step | Check | Tooling |
|------|-------|---------|
| 1. Surface | Allow/deny table above → application-code **or** non-application-code; **does not** by itself select `full` | path classification |
| 2. Large diff | Total changed lines > 400 **or** changed files > 20 ⇒ **full** | `git diff --stat` (three-dot) |
| 3. Breaking signal | Title/description/commit messages match `migration\|schema\|breaking\|API contract\|deprecat` (case-insensitive) ⇒ **full** | PR metadata scan |
| 4. Post-fail re-entry | Prior Part R **fail** on this tip, re-presented after fixes ⇒ **full**. **Part R only** — Part C `coverage-gate: auto` MUST NOT treat this step as a scale/risk hit | Part R history |
| 5. Sensitive path/keyword | Any changed **application-code** path matches a glob below, **or** title/description/commit subject matches a keyword below ⇒ **full** | path + PR metadata vs tables in this file |
| No hit | Steps 2–5 clean ⇒ **light** (including application-code) | — |

Pass gate is depth-invariant: neither axis retains ≥80 Critical/Important, at either depth (`pr-code-review` hard rule「light MUST NOT weaken the gate」). Line/file thresholds (400 / 20) and the sensitive tables are repo-tunable constants — adjust in this file only, SKILL.md points here.

## Sensitive paths and keywords

Used only as an **escalation to `full`**, never as a skip. Matching is case-insensitive. Path globs apply to denylisted / application-code changed paths (not to allowlisted docs/skills markdown). Keywords scan PR title, description, and commit subjects.

### Path globs (any changed application-code path)

| Glob |
|------|
| `**/*auth*` |
| `**/*oauth*` |
| `**/*session*` |
| `**/*permission*` |
| `**/*rbac*` |
| `**/*crypto*` |
| `**/*jwt*` |
| `**/*password*` |
| `**/*secret*` |
| `**/*payment*` |
| `**/*billing*` |

### Keywords (title / description / commit subject)

`auth`, `oauth`, `session`, `permission`, `rbac`, `crypto`, `jwt`, `password`, `secret`, `payment`, `billing`, `csrf`
