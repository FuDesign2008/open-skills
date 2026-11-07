## MODIFIED Requirements

### Requirement: Review SHALL keep Standards and Spec axes separate

`staged-review-flow` MUST treat review as two axes that MUST NOT be merged into a single ranked list: **Standards** (design/quality/smell/security fitness) and **Spec** (fit to the chosen solution, ticket, or OpenSpec delta). Axes MAY run in parallel; when they do, the admission test, bounded return contract, and collection duty come from `parallel-delegation-discipline` and MUST NOT be restated here. A pass on one axis MUST NOT hide a fail on the other. Host workflows MUST NOT collapse both into one undifferentiated score.

#### Scenario: Dual-axis verdict

- **WHEN** a PDCA review stage completes after this change
- **THEN** the report states Standards and Spec outcomes separately (or equivalent labels), and blocking issues on either axis block overall pass

#### Scenario: Parallel axes defer to the delegation discipline

- **WHEN** a host runs the two axes as separate delegated units
- **THEN** it applies `parallel-delegation-discipline` for the admission test and the bounded returns, and keeps the final cross-axis verdict serial
