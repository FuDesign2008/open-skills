# Spec Delta

## MODIFIED Requirements

### Requirement: Part R pass/fail SHALL use dual-axis clearance

Part R MUST treat `pr-code-review` as failed (block merge) when either the Standards or Spec axis retains one or more issues at confidence ≥80 with severity Critical or Important, unless the user gives an explicit Part R skip 留痕. Minor-only survivors or all scores below 80 MUST count as Part R pass. Part R MUST NOT require a receiving-code-review reception loop to pass. Light depth MUST NOT weaken this clearance rule. A fail that leads to source-tip fixes MUST NOT unlock Part D by itself: Part D MUST wait for a later Part R pass on the post-fix tip, an explicit Part R skip 留痕, or the round-cap human pause outcome defined by the re-review loop requirement.

#### Scenario: Spec-axis Important blocks merge

- **WHEN** `pr-code-review` posts an Important Spec finding scored ≥80 and Standards is clean
- **THEN** merge-discipline blocks Part D until a later Part R pass on the tip, an explicit Part R skip 留痕, or a round-cap human decision that accepts residual blocking with 留痕 or aborts merge

#### Scenario: Dual-axis clean proceeds to tip pin

- **WHEN** both axes have no remaining ≥80 Critical/Important issues
- **THEN** Part R passes and Part D tip pinning runs next

#### Scenario: Fixes alone do not unlock Part D

- **WHEN** Part R fails dual-axis clearance and the agent pushes fixes on the source tip without a new Part R run
- **THEN** Part D and the merge command MUST NOT run

## ADDED Requirements

### Requirement: Part R SHALL re-review until clean before Part D

When Part R fails dual-axis clearance and the agent applies source-tip fixes (not an explicit Part R skip), Part R MUST re-invoke `pr-code-review` on the new tip before Part D. The loop is review → fix tip → re-review. Exit to Part D ONLY on a clean dual-axis pass or an explicit Part R skip 留痕.

#### Scenario: Fix then re-review passes

- **WHEN** Part R fails, the agent pushes fixes, and the next Part R run on that tip has no ≥80 Critical/Important on either axis
- **THEN** Part R passes and Part D may proceed

#### Scenario: Explicit skip still unlocks without clean review

- **WHEN** Part R has failed and the user provides an explicit Part R skip 留痕
- **THEN** Part R may proceed to Part D without requiring a clean re-review

#### Scenario: Re-entry keeps post-fail full depth

- **WHEN** a prior Part R fail on this tip is re-presented after fixes
- **THEN** depth selection MUST still apply the post-fail → full escalation signal

#### Scenario: Skipped Part R does not enter the loop

- **WHEN** preference is `never` or the user gave ask-skip 留痕 so Part R did not run
- **THEN** the re-review loop MUST NOT run and Part D follows the existing skip path

### Requirement: Part R SHALL cap fail-fix-re-review at three rounds

Each `pr-code-review` invocation in one merge attempt counts as one round. The fail→fix→re-review loop MUST cap at **3** rounds. If round 3 still fails dual-axis clearance, Part R MUST pause and ask the user to choose: continue another review round / accept residual blocking with 留痕 / abort merge — and MUST NOT auto-enter Part D.

#### Scenario: Second round still fails then third passes

- **WHEN** Part R fails twice after successive fixes and the third review round on the latest tip is dual-axis clean
- **THEN** Part R passes and Part D may proceed

#### Scenario: Three rounds still blocking

- **WHEN** three Part R review rounds in one merge attempt have each retained ≥80 Critical/Important findings after any intervening fixes
- **THEN** Part R pauses for the user (continue another round / accept residual with 留痕 / abort) and MUST NOT enter Part D automatically
