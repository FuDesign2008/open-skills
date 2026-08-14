# perf-iteration-loop Specification

## Purpose
Hard protocol for the performance-optimization iteration loop: the six-step round contract (profile → one target → optimize → A/B judge → correctness gate → commit+snapshot+log), stop conditions, and platform-agnostic execution tiers. Mounted by `perf-optimize-workflow` via frontmatter `dependencies`; loop runners accelerate execution but never replace the protocol.

## Requirements
### Requirement: Loop protocol contract

The skill MUST define a six-step round contract executed in order every round (profile fresh hotspots → pick exactly one target → optimize it → A/B cross-run judge with revert on rejection → correctness gate before commit → commit + baseline snapshot + benchmark-log row), and stop conditions (5 consecutive no-gain rounds / target met / ROI exhausted). It MUST be `user-invocable: false` with no frontmatter dependencies, and MUST NOT depend on any host workflow or on any environment-specific loop runner.

#### Scenario: Round rejected by the judge

- **WHEN** a round's A/B result fails the acceptance rule (`avg_B − avg_A > max(stdev_B, stdev_A)`)
- **THEN** the round's change is reverted and the rejection is logged with reason, without stacking speculative changes on top

#### Scenario: Stop after convergence

- **WHEN** 5 consecutive rounds produce no accepted gain
- **THEN** the loop stops and reports rounds accepted/rejected, total measured gain vs baseline, and remaining bottlenecks with ROI assessment

### Requirement: Platform-agnostic execution tiers

The skill MUST express loop execution as intent: an environment loop runner (ralph-style) MAY drive round cadence, and absent one the executing agent MUST self-drive serial rounds — both tiers obey the identical round contract and stop conditions.

#### Scenario: No loop runner in the environment

- **WHEN** the host workflow runs in an environment without any loop-runner plugin
- **THEN** rounds still execute serially under the same contract; the loop is not skipped or shortened

