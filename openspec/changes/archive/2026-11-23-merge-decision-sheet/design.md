## Context

`merge-discipline` runs Parts A→B→C→R→D. Four of them can ask the human something: Part B (rebase confirm), Part C (coverage run/skip under `ask`), Part R (review full/light/skip under `ask`), Part D (squash/no-squash, then optional branch deletion). Today each question fires at its own Part, after the preceding slow step has finished, so one merge can stall repeatedly. None of those answers depends on a result produced by an earlier Part; they depend on repo state and preference lines that are readable up front.

User-approved scope (option 1): batch **preference** questions only; keep `clarifying-question-discipline` unchanged.

## Goals / Non-Goals

**Goals**
- One read-only preflight, one batch form, then uninterrupted execution of A→B→C→R→D.
- Each item carries options, a Recommended answer, and a one-line rationale.
- Empty sheet means no prompt.
- Mid-flight failures remain separate pauses.

**Non-Goals**
- No change to what each Part decides or to gate semantics (dual-axis clearance, 3-round cap, tip pinning, ancestor check).
- No change to `clarifying-question-discipline`, `pr-code-review`, or host workflows beyond the checklist wording sync.
- No auto-answering of the sheet in auto-mode.

## Decisions

### D1. Preflight is read-only and fact-based (iron law 10)
Every sheet-inclusion rule is a verifiable signal, not AI judgment: association (diff paths / `openspec list`), `BEHIND`/`CONFLICTS` counts, preference regex lines, collapse pre-check (commit count = 1 or single permitted merge method). The only judgment input is the squash *recommendation*, which already exists and affects only the default highlighted option, not whether an item appears.

### D2. Item inclusion table
| Item | Included when | Source of truth |
|---|---|---|
| Archive | Part A would block | association rules |
| Rebase | BEHIND>0 or CONFLICTS>0 | Part B detect |
| Coverage | `coverage-gate` ask/unset | preference regex |
| Review | `pr-review-gate: ask` | preference regex; Recommended depth = ladder result |
| Squash | ≥2 commits and no collapse | Part D collapse pre-check |
| Delete branch | optional; only riding along when another item exists | — |

Delete-branch never causes a prompt alone, otherwise the "empty sheet" case could never occur (it would always have at least that item). With no sheet it stays the non-blocking post-sync offer.

### D3. Archive item semantics
Part A default is block-and-archive; skip requires explicit 留痕. The sheet shows both options with block+archive Recommended. If the user picks archive first, the tip will change, so the current attempt ends and re-entry from Part A starts a new attempt with a fresh preflight and sheet (consistent with Part B's existing "each attempt re-enters from Part A" loop bound). Answers are not carried across attempts; this avoids stale squash/rebase answers on a changed tip at the cost of possibly re-asking tip-dependent items once after archive.

### D4. Rebase item and the main spec gap
Rebase confirm existed only in `SKILL.md`. Rather than hiding it inside the sheet requirement, add a dedicated Part B requirement so the main spec has a place that states "no rebase without confirmation" and "consume the sheet answer". Options: rebase now / proceed without rebase (only when `CONFLICTS=0`) / abort.

### D5. Consumption after rebase
After rebase rewrites the tip, C/R/D re-run *detection* (analyzer needs `--base`, Part R classifies the new diff, Part D re-lists commits) but reuse the *answers*. Part D re-lists commits on the pinned tip, states any difference, and applies the answer; if the new list satisfies the collapse pre-check, the collapse conclusion applies (no prompt either way). A new mid-flight failure (e.g., Part R fail) uses its existing separate pause.

### D6. What stays a pause
Everything that depends on a result not available at preflight: Part R fail / round cap, coverage below threshold / crash / no report / no tests, analyzer unavailable after run decision, stuck rebase conflict or abort, ancestor MISSING, fast-forward blocked. They are listed explicitly so the sheet cannot swallow them.

### D7. Carve-out from `clarifying-question-discipline`
Stated in `merge-discipline` (not in the discipline skill): the sheet is a bounded batch of preference decisions with recommended answers, not a clarify interview, so one-question-per-turn does not apply. The carve-out is scoped to the sheet; mid-flight pauses and any other question stay governed by the normal rules.

### D8. Platform-neutral rendering
Skill body describes the intent ("one structured batch form; fall back to a numbered prose list") with no platform-tool enumeration (iron law 6). A compact answer shorthand (e.g. `1A 2B 3A`, or `all recommended`) is defined in `reference.md`.

### D9. Iron law 9 reverse lookup
Searched `openspec/specs` and `skills` for the changed phrasing (`ask`, `wait for user`, `per-merge ask`, `squash decision`, `preference/ask decision`, checklist "asked user"). Hits and disposition:
- `merge-discipline`: trigger requirement ("Part C's preference/ask decision") → MODIFIED; coverage / Part R / Part D squash / Part D sync → MODIFIED.
- `workflow-contract-sync` checklist requirement ("`ask` 时是否已询问用户") → MODIFIED (sheet-based asking accepted).
- `workflow-contract-sync` coverage-trigger requirement ("按…每次询问规则") and gate-miss requirements: wording is preference-level and still true; no change.
- `feature-branch-closeout` spec/skill: delegates to merge-discipline without restating questions; no change. (Pre-existing drift: its spec says Parts "A→B→C→D", omitting R. Out of scope; flagged.)
- Host SKILL.md / reference.md thin references: grep shows pointers only; no change.
- `merge-discipline` SKILL.md "Mode lifecycle" paragraph ("wait for ask answer") and `reference.md` checklist items ("asked user…") → updated in the skill edit.

## Risks / Trade-offs

- **Stale preflight**: facts can drift between preflight and execution (target moves again). Mitigation: Part B / D detection still runs at execution time; a new mid-flight failure pauses as before.
- **Large sheet fatigue**: up to six items. Mitigation: only items needing input appear; `all recommended` shorthand.
- **Archive-first wastes other answers**: accepted (D3).
- **Doc drift in feature-branch-closeout spec** (A→B→C→D): flagged, not fixed here.
- **Behavior eval is dry-run only**: evals are prompt-based expectations, not executed against a live MR.

## Migration Plan

Skill-only change; ships via the normal release (minor version bump of `merge-discipline`). No data migration. Rollback = revert the skill edit; main specs revert with the archive.
