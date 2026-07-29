# completion-evidence-discipline Specification

## Purpose
Fresh-evidence gate for verification and completion claims in PDCA workflows.

## Requirements
### Requirement: Completion claims SHALL require fresh evidence from the current turn

When an agent would claim that verification passed, a fix works, tests are green, or the task is complete, it MUST base that claim on evidence produced by commands or checks executed in the **current turn** (or clearly labeled pending manual actions). MUST NOT treat designed scenarios, prior-turn memory, or subagent success reports alone as sufficient evidence. The shared skill implementing this gate MUST be named `completion-evidence-discipline` (MUST NOT reuse the Superpowers name `verification-before-completion`).

#### Scenario: Block bare pass claim

- **WHEN** an agent is about to report "tests passed" or "verification complete" without having run the relevant command in this turn
- **THEN** it MUST run the command (or mark the item pending with the exact action required) before claiming pass

#### Scenario: Non-colliding skill name

- **WHEN** the new shared skill is added under `skills/`
- **THEN** its directory and frontmatter `name` are `completion-evidence-discipline`, and it does not collide with Superpowers or mattpocock/skills skill names
