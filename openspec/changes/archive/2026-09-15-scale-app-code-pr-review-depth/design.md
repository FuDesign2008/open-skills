## Context

`merge-discipline` Part R already has `pr-review-gate` (`always` | `never` | `ask` | `non-code-light` | `auto`) and a surface classifier. The skill treats unset as `auto` and content-matches depth, but **application-code short-circuits to `full`** before the size/risk rungs run. Those rungs (400 lines / 20 files / breaking keywords / fail re-entry) only escalate documentation PRs up to `full`. The main OpenSpec spec still says unset ≡ `always`, so spec and skill disagree.

Approved solution **C**: keep reviewing application code and keep the ≥80 gate; choose `light` vs `full` from scale **and** risk; force `full` on sensitive paths/keywords so a one-line auth change does not drop to `light`. Apply that ladder to `auto` / unset **and** to `non-code-light` application-code (docs stay `light`). `always` remains blanket swarm.

Constraints: YAGNI (no new gate value, no host methodology copy); pass gate depth-invariant; standalone `pr-code-review` with no depth stays `full`.

## Goals / Non-Goals

**Goals:**
- Application-code under `auto` / unset / `non-code-light` uses the size/risk ladder instead of always `full`.
- Escalation → `full`: existing scale/breaking/re-entry signals plus a tunable sensitive-path / keyword table in `merge-discipline/reference.md`.
- No hit → `light` (dual-axis still mandatory).
- Align main spec: allowed values include `auto`; unset ≡ `auto`.
- Update evals so “application-code ⇒ full” is no longer the expected default without an escalation hit.

**Non-Goals:**
- Skipping Part R on small application-code diffs.
- Weakening light’s ≥80 Critical/Important clearance.
- Changing standalone “审这个 PR” default (`full`).
- Changing `always` / `never` / `ask`.
- Host workflow SKILL bodies restating the ladder.
- Measuring Vega or adding runtime telemetry.

## Decisions

1. **Single decision point = Part R.** `pr-code-review` still only consumes `depth=full|light`. Intelligence stays in `merge-discipline` so callers that pass depth are unchanged.

2. **Ladder order (auto / unset, and non-code-light on application-code):**
   1. Resolve preference (`never` skip / `ask` wait / `always` → full and stop).
   2. Classify surface (existing allow/deny table).
   3. If non-application-code and preference is `non-code-light` or `auto` with no escalation → `light` (same as today for docs).
   4. If application-code (or docs that hit scale/breaking/re-entry under `auto`): apply escalation table; any hit → `full`; else → `light`.
   5. **Delete** the rule “Application-code always → full (escalation is irrelevant)”.

3. **Sensitive table (new, lives next to 400/20 in reference.md).** Case-insensitive. Any changed path matching a glob **or** PR title / description / commit subject matching a keyword → `full`. Initial globs: `**/*auth*`, `**/*oauth*`, `**/*session*`, `**/*permission*`, `**/*rbac*`, `**/*crypto*`, `**/*jwt*`, `**/*password*`, `**/*secret*`, `**/*payment*`, `**/*billing*`. Initial keywords: `auth`, `oauth`, `session`, `permission`, `rbac`, `crypto`, `jwt`, `password`, `secret`, `payment`, `billing`, `csrf`. Repos tune this file only; SKILL.md points here (same pattern as the line/file thresholds).

4. **Spec sync.** Preference regex already includes `auto` in the skill; spec must list `auto` and unset ≡ `auto`. Scenario “Unset preference means full review” is replaced by the auto ladder.

5. **This repo.** `AGENTS.md` stays `pr-review-gate: non-code-light`. After this change, a small low-risk `scripts/*.mjs` or `*.ts` PR here gets `light`; a skills-only Markdown PR still `light`; a path matching the sensitive table still `full`.

6. **Evals.** Replace/extend the case “denylist → application-code → depth=full” with: small low-risk application-code → `light`; large or sensitive → `full`; `always` still `full` on a tiny diff.

**Alternatives rejected:** new opt-in gate value (would not cut spend until every repo opts in); global default `light` including no sensitive force-full (drops the one-line auth case); size-only downscale without sensitive table (same gap).

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Sensitive globs too wide (`*session*` matching `SessionLog.md` under docs) | Surface is classified first; docs/skills allowlist still `light` unless `auto` scale/breaking hits. Globs apply to **application-code** paths (and to title/commit keywords). |
| Sensitive table too narrow | Tunable in reference.md; `always` remains the escape hatch. |
| Spec said unset=`always`, skill said `auto` — aligning spec to skill changes agents that followed spec | Skill is what agents load; spec catching up is the correction, not a silent relaxation of `always`. |
| Light misses bugs on small runtime diffs | Dual-axis ≥80 still runs; swarm (blame/history) is what we skip, not review. |

## Migration Plan

- Skill PATCH on `merge-discipline` (behavior change, no install-breaking rename).
- Archive this change into `openspec/specs/merge-discipline`.
- No data migration. Rollback = revert the skill + spec text.

## Open Questions

None blocking. Keyword/glob set can be tightened after the first noisy false-full reports without another architecture change.
