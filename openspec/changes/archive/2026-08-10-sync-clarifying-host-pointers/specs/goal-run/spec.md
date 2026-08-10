## MODIFIED Requirements

### Requirement: 长跑前置需求对齐

The system SHALL perform requirement clarification and output-contract alignment before starting a goal long-run, following `clarifying-question-discipline` (one question per turn; multi-round until clear; clarify first). The host MUST NOT restate that skill's decision-tree rules or purpose→constraints→success priority checklist in the stage body; it MUST keep only thin touchpoints (pointer, per-turn quantity, Red Flags).

#### Scenario: 产出需求对齐清单

- **WHEN** 用户触发 goal 长跑（如「goal 长跑 xxx」「一个 goal 下去跑 xxx」）
- **THEN** 系统通过一次一问澄清目标、产出物、范围、非目标、约束、预算，并产出需求对齐清单（模板1）

#### Scenario: Host does not restate clarifying priority checklist

- **WHEN** an agent reads `goal-driven-workflow` stage 1 instructions for asking clarifying questions
- **THEN** the stage body points at `clarifying-question-discipline` for question selection rules and MUST NOT embed the purpose→constraints→success priority chain as host-local methodology

## ADDED Requirements

### Requirement: Goal-run clarify stage SHALL use clarifying Prefer pointer

The `goal-driven-workflow` clarify stage MUST include a prominent one-line pointer to `clarifying-question-discipline` whose English Prefer form matches clarifying's Prefer slogan (one question per turn; multi-round until clear; clarify first, do not rush to answer). A locale-equivalent one-liner MAY appear alongside the English Prefer line.

#### Scenario: English Prefer pointer present

- **WHEN** an agent opens stage 1 of `goal-driven-workflow`
- **THEN** the stage includes a tagged pointer that names `clarifying-question-discipline` and the English Prefer clarifying slogan

### Requirement: Goal-run clarify stage SHALL flag multi-question dumps

The `goal-driven-workflow` clarify stage MUST list dumping multiple clarifying questions/open points in one message, and rushing to answer during clarification, as Red Flags (with the one-question-per-turn fix).

#### Scenario: Multi-question dump is a Red Flag

- **WHEN** stage 1 Red Flags are defined for `goal-driven-workflow`
- **THEN** they include dumping multiple questions/open points at once and rushing to answer during clarification
