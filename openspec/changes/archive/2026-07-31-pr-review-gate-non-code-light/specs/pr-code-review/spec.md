## ADDED Requirements

### Requirement: pr-code-review SHALL support depth full and light

When invoked by `merge-discipline` Part R (or a caller that passes depth), `pr-code-review` MUST accept `depth=full` (default) or `depth=light`.

- **full**: current behavior — dual-axis Standards∥Spec with multi-perspective review preferred in parallel when the host supports it.
- **light**: dual-axis Standards∥Spec on the pinned tip is still mandatory; multi-perspective parallel swarm is NOT required; confidence ≥80 Critical/Important clearance and publish rules remain the same as full for Part R pass/fail.

Standalone user triggers without depth MUST default to `full`.

#### Scenario: Part R requests light depth

- **WHEN** `merge-discipline` Part R invokes `pr-code-review` with `depth=light`
- **THEN** the skill runs dual-axis clearance without requiring parallel multi-perspective dispatch

#### Scenario: Default depth is full

- **WHEN** the skill is invoked without a depth parameter
- **THEN** it runs at full depth

## MODIFIED Requirements

### Requirement: Eligibility and Claude-style pipeline SHALL remain

`pr-code-review` MUST retain: open/non-draft eligibility (and skip trivial/already-reviewed-this-session cases with a stated reason); per-issue confidence 0–100 with **drop below 80**; false-positive discard rules; and publish via platform CLI with full-SHA permalinks when commenting. Light depth MUST NOT weaken the ≥80 Critical/Important Part R gate.

#### Scenario: Light depth keeps clearance bar

- **WHEN** `depth=light` and an Important Standards finding scores ≥80
- **THEN** Part R still treats the review as failed until fixed or explicit skip
