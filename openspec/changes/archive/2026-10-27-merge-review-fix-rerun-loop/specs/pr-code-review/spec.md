# Spec Delta

## ADDED Requirements

### Requirement: Part R fail SHALL defer merge unlock to merge-discipline re-review

When `pr-code-review` fails dual-axis clearance (≥80 Critical/Important on Standards or Spec), the skill MUST report fail to the caller and MUST NOT imply that implementing the findings alone unlocks a protected-branch merge. `merge-discipline` Part R MUST own the fix → re-review-until-clean loop (or an explicit Part R skip 留痕) before Part D. This skill MAY document a thin reception pointer; it MUST NOT require a full receiving-code-review subflow for Part R to eventually pass.

#### Scenario: Fail hands orchestration to Part R

- **WHEN** `merge-discipline` Part R invokes `pr-code-review` and either axis retains a ≥80 Critical/Important finding
- **THEN** the skill reports fail and Part R remains responsible for re-review on the post-fix tip (or explicit skip) before tip pinning

#### Scenario: Implementing findings is not a Part R pass

- **WHEN** an agent applies code changes for published review findings without a new `pr-code-review` run on that tip
- **THEN** that alone MUST NOT be treated as a Part R pass by this skill's host contract
