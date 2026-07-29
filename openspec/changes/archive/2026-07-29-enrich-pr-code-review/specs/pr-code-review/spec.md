## ADDED Requirements

### Requirement: PR code review SHALL use dual-axis Standards and Spec reports

`pr-code-review` MUST present findings under separate **Standards** and **Spec** axes and MUST NOT merge or re-rank findings across axes into one undifferentiated list. A pass on one axis MUST NOT hide a fail on the other.

#### Scenario: Dual-axis report structure

- **WHEN** the skill finishes a review with findings on both axes
- **THEN** the published or in-session report contains distinct Standards and Spec sections (or equivalent labels) without a single cross-axis priority ranking

### Requirement: PR code review SHALL pin a fixed point and resolve Spec sources

Before spawning review perspectives, `pr-code-review` MUST pin a review fixed point (PR/MR base ref, or user-supplied commit/branch, or `origin/<default>` when reviewing a PR about to merge) and MUST confirm the three-dot diff against that point is non-empty. It MUST attempt to resolve a Spec source in order: PR/issue body and linked tickets, user-supplied path, OpenSpec delta / `openspec/specs` for the change, then ask or skip Spec with an explicit "no spec available" note.

#### Scenario: Empty diff aborts before perspectives

- **WHEN** the fixed point resolves but `git diff <fixed-point>...HEAD` (or PR equivalent) is empty
- **THEN** the skill stops with a clear error and does not launch multi-perspective review

#### Scenario: Missing spec skips Spec axis only

- **WHEN** no Spec source can be found and the user does not provide one
- **THEN** Standards (and other perspectives) still run; Spec reports skipped / no spec available

### Requirement: PR code review SHALL keep Claude-style eligibility, confidence filter, and publish rules

`pr-code-review` MUST retain: open/non-draft eligibility (and skip trivial/already-reviewed-this-session cases with a stated reason); multi-perspective review (guidelines, bugs-in-diff, history/blame, prior PR comments, in-file comments) preferably in parallel; per-issue confidence 0–100 with **drop below 80**; false-positive discard rules (pre-existing, nits, linter-catchable, unchanged lines); and publish via platform CLI with full-SHA permalinks when commenting.

#### Scenario: Low-confidence issues are not published as blockers

- **WHEN** candidate issues exist but all score below 80 after scoring
- **THEN** the skill treats the review as pass for merge-host purposes and MAY post a "no issues" comment (or silent pass per host)

### Requirement: PR code review SHALL calibrate severity and plan alignment

Findings that survive the confidence filter MUST carry a severity of Critical, Important, or Minor. The skill MUST check plan/PR-body/OpenSpec-delta alignment when a Spec or plan source exists (missing planned behavior, unjustified scope creep, wrong implementation of a stated requirement). The report MUST acknowledge strengths before listing issues when any strengths are observed.

#### Scenario: Plan drift flagged on Spec axis

- **WHEN** the PR body or linked plan requires behavior X and the diff omits X
- **THEN** a Spec-axis finding cites the plan/spec line and is eligible for ≥80 scoring

### Requirement: PR code review SHALL NOT hard-gate on receiving-code-review discipline

`pr-code-review` MAY document a thin pointer for post-feedback reception (verify before implementing; no performative agreement; reasoned pushback). Merge-discipline Part R MUST NOT require running a full receiving-code-review flow to pass.

#### Scenario: Part R pass without reception loop

- **WHEN** `merge-discipline` Part R invokes `pr-code-review` and the review passes dual-axis clearance
- **THEN** Part R proceeds to tip pinning without requiring a reception-discipline subflow

### Requirement: Standards axis MAY apply a smell baseline subordinate to repo docs

When repo guidance (`AGENTS.md` / `CLAUDE.md` / coding standards) is silent, the Standards axis MAY apply a short Fowler smell baseline from `pr-code-review/reference.md` as judgement-call heuristics. Documented repo rules MUST override the baseline. Smells MUST NOT be treated as hard violations solely from the baseline.

#### Scenario: Repo rule wins over smell baseline

- **WHEN** a baseline smell would flag a pattern that `AGENTS.md` explicitly allows
- **THEN** the Standards axis does not publish that smell as a finding
