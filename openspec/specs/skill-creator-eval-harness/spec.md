# skill-creator-eval-harness Specification

## Purpose
Rules for deferred full skill-creator eval follow-ups after light-verified skill rewrites (baseline choice and minimum prompt coverage).

## Requirements
### Requirement: Deferred full skill-creator evals SHALL use an explicit prior-version baseline

When a skill rewrite ships with light verification only and defers the full skill-creator eval loop, the follow-up eval change MUST compare the current skill against an **explicit prior-version baseline** (e.g. git snapshot of the pre-rewrite skill files), not only against a no-skill baseline — unless product owners document otherwise.

#### Scenario: Batch-1 English rewrite eval baseline

- **WHEN** evaluating the six workflow skills English-rewritten in the migrate-workflow-skills-en-batch1 change
- **THEN** each eval run pair includes `with_skill` (current English) and `old_skill` (Chinese body snapshot from before that rewrite)

### Requirement: Lightweight eval batches SHALL still cover trigger and gate behavior

A lightweight skill-creator batch (2–3 prompts per skill) MUST still include at least one prompt that exercises **Chinese/English trigger recognition** and one that exercises a **stage-gate or clarifying-discipline** behavior for workflow skills.

#### Scenario: Minimum coverage per workflow skill

- **WHEN** the batch-1 English eval harness is executed for a host workflow skill
- **THEN** its eval set includes ≥1 trigger/mode prompt and ≥1 stage-gate or clarifying prompt
