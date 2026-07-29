## ADDED Requirements

### Requirement: Review SHALL keep Standards and Spec axes separate

`pdca-review-orchestration` MUST treat review as two axes that MUST NOT be merged into a single ranked list: **Standards** (design/quality/smell/security fitness) and **Spec** (fit to the chosen solution, ticket, or OpenSpec delta). Axes MAY run in parallel. A pass on one axis MUST NOT hide a fail on the other. Host workflows MUST NOT collapse both into one undifferentiated score.

#### Scenario: Dual-axis verdict

- **WHEN** a PDCA review stage completes after this change
- **THEN** the report states Standards and Spec outcomes separately (or equivalent labels), and blocking issues on either axis block overall pass

### Requirement: Verification honesty SHALL compose with completion-evidence-discipline

Verification stages that use `pdca-review-orchestration`'s honesty rule MUST also follow `completion-evidence-discipline`: "executed" labels require fresh current-turn evidence; otherwise items stay pending.

#### Scenario: Honesty points at completion evidence

- **WHEN** a host verification stage labels results
- **THEN** it applies both honesty labels and the completion-evidence gate (no bare pass without evidence)
