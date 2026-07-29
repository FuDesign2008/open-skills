## MODIFIED Requirements

### Requirement: PDCA review stage SHALL load shared review orchestration

PDCA fix workflows that perform a solution-review stage (solve-workflow / opsx-solve-workflow / jira-fix-workflow / opsx-jira-fix-workflow) MUST load `staged-review-flow` (formerly `pdca-review-orchestration`) and follow it for decision-level and code-design review flow. Host workflows MUST NOT restate the full binary pass/fail loop, auto 3-round optimization rules, or design-summary template in their SKILL.md body. Directory name and frontmatter `name` MUST be `staged-review-flow`.

#### Scenario: Host thin-refs review orchestration

- **WHEN** an agent reaches the review stage of a referencing workflow
- **THEN** it loads `staged-review-flow`, applies the workflow's placeholder map, and does not paste the shared loop prose into the host skill

### Requirement: Decision-level review SHALL always run solution-review

`staged-review-flow` MUST require a full `solution-review` (core + strategic dimensions per that skill) for every reviewed solution. When the solution involves code changes, it MUST also run `code-design-review` Layer A/B/C per that skill. Hosts MUST NOT substitute a shortened four-bullet checklist for `solution-review`.

#### Scenario: opsx-solve aligns with full solution-review

- **WHEN** `opsx-solve-workflow` runs its review stage after this change
- **THEN** the agent runs full `solution-review` via `staged-review-flow`, not only a four-dimension inline list

### Requirement: Orchestration SHALL support intentional divergences via placeholders

`staged-review-flow` MUST define placeholders for host-specific behavior (at least `{next-stage}`, artifact sink / extra dimensions, and batch over-cap behavior) and MUST NOT sink Jira-only or OpenSpec-only artifact paths into the shared skill as hard-coded stage numbers.

#### Scenario: Placeholder mapped at reference line

- **WHEN** a host references the skill
- **THEN** its reference block supplies number+name maps for placeholders; the shared skill contains no host stage numbers

### Requirement: Verification honesty SHALL live in the shared orchestration skill

The "已执行 / 待执行" verification-report honesty rule MUST be defined once in `staged-review-flow` (or its reference) for use by verification stages. Host workflows MUST point to it with at most one sentence and MUST NOT duplicate the full honesty prose.

#### Scenario: Four hosts drop duplicated honesty blocks

- **WHEN** Wave 2a lands
- **THEN** the four PDCA workflows no longer each contain a near-verbatim「验证报告诚实原则」section; they point at the shared skill

### Requirement: Review SHALL keep Standards and Spec axes separate

`staged-review-flow` MUST treat review as two axes that MUST NOT be merged into a single ranked list: **Standards** (design/quality/smell/security fitness) and **Spec** (fit to the chosen solution, ticket, or OpenSpec delta). Axes MAY run in parallel. A pass on one axis MUST NOT hide a fail on the other. Host workflows MUST NOT collapse both into one undifferentiated score.

#### Scenario: Dual-axis verdict

- **WHEN** a PDCA review stage completes after this change
- **THEN** the report states Standards and Spec outcomes separately (or equivalent labels), and blocking issues on either axis block overall pass

### Requirement: Verification honesty SHALL compose with completion-evidence-discipline

Verification stages that use `staged-review-flow`'s honesty rule MUST also follow `completion-evidence-discipline`: "executed" labels require fresh current-turn evidence; otherwise items stay pending.

#### Scenario: Honesty points at completion evidence

- **WHEN** a host verification stage labels results
- **THEN** it applies both honesty labels and the completion-evidence gate (no bare pass without evidence)
