# evolution-review Specification

## Purpose

Data-driven portfolio-level monthly selection review: judge works/experiments/product lines by platform-sourced outcome data (never self-report), fix two-period winners into default recipes, kill unvalidated items without sentiment (recording failure recipes), budget exploration with a 15~20% mutation quota that is both ceiling and floor, judge direction on a 3-month rolling window (single-month swings never change direction), and keep the portfolio diverse. Distinct from `learn-and-improve`, which owns single-task retrospectives — the two chain: portfolio selection first, single-item retrospective second.

## Requirements

### Requirement: The skill SHALL run portfolio selection on platform-sourced dual metrics, never self-report

The skill MUST require review inputs from platform settlements / analytics / reconciled numbers; items without data MUST be marked "unreconciled" and down-weighted in extinction review; the skill MUST NOT produce scale/kill recommendations from self-reported feelings.

#### Scenario: No-data item reaches verdict

- **WHEN** a portfolio item has no platform-sourced metrics
- **THEN** the skill marks it "unreconciled" and down-weights it in extinction review instead of judging on feelings

### Requirement: The skill SHALL use two-period confirmation before fixation and a 3-month rolling window for direction

Fixation requires two consecutive winning periods; direction judgment uses a 3-month rolling window; single-month swings MUST NOT trigger direction changes; the mutation quota (15~20%) is both ceiling and floor and unspent quota expires.

#### Scenario: Single-month breakout

- **WHEN** one item spikes in a single month
- **THEN** the verdict stays Observing until the rolling window confirms, the direction does not change, and exploration budget remains capped by the mutation quota

### Requirement: The skill SHALL record failure recipes at extinction and keep verdicts three-valued

Extinction MUST record the failed recipe (asset against repetition) and land as one of three concrete actions (unlist / archive / stop investing); verdicts are Fixed / Observing / Extinct; a diversity check prevents single-niche portfolios.

#### Scenario: Kill decision without data culture

- **WHEN** the user resists killing an unvalidated item
- **THEN** the skill attributes the resistance to sunk cost, records the failure recipe, and lands the kill as a concrete action with resources reallocated to validated lines
