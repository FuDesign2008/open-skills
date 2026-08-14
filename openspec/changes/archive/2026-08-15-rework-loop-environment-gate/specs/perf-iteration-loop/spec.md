## REMOVED Requirements

### Requirement: Loop protocol contract

Removed: the six-step round contract and stop conditions move into `perf-optimize-workflow`'s iteration-loop section (mount-body spec); the loop mechanism itself is an environment loop-runner capability, not a repo skill.

### Requirement: Platform-agnostic execution tiers

Removed: the "self-drive rounds without a runner" tier is withdrawn — without an environment loop runner, optimization execution stops (runtime environment gate owned by `perf-optimize-workflow`).
