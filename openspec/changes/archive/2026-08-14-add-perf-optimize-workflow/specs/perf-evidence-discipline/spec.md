## ADDED Requirements

### Requirement: Nine disciplines with detection methods

The skill MUST define nine disciplines — environment-throttling artifacts, monitor self-pollution, framework counter ambiguity, device-profile calibration, input-event authenticity, instrumentation toggle lifecycle, single-sample extrapolation ban, ultimate control experiment, negative-results-leave-traces — each with what it catches, how to detect it, and what to do instead; full anonymized cases live in `reference.md`.

#### Scenario: Counter conflicts with native metric

- **WHEN** a framework-internal counter and a browser-native metric disagree in magnitude
- **THEN** the browser-native metric is trusted and the counter is demoted to trend-only signal

### Requirement: Gate rule — decision-grade vs trend-only

For any metric whose applicable discipline is unresolved, the metric MUST be marked not decision-grade: it may appear as trend context but MUST NOT drive optimization choices, priorities, or pass/fail verdicts.

#### Scenario: Throttled frame metric

- **WHEN** frame-class metrics come from a controlled (headless/occluded/background) browser and no profiler sampling has ruled out throttling artifacts
- **THEN** those metrics are excluded from optimization decisions until cleared

### Requirement: Mount via host dependency, no reverse dependency

The skill MUST be `user-invocable: false` and declare no frontmatter dependencies; `perf-optimize-workflow` (or any other host) declares this skill in its `dependencies` and mounts disciplines at its own evidence/locate/hypothesis/verify stages. The skill MUST NOT depend on any host workflow.

#### Scenario: Host declares the gate

- **WHEN** `perf-optimize-workflow` starts its prerequisite check
- **THEN** a missing `perf-evidence-discipline` aborts the workflow rather than degrading silently

### Requirement: Platform-agnostic rules, concrete cases in reference

Discipline rules in `SKILL.md` MUST be stated at intent level (no platform-specific tooling as required means); concrete anonymized cases, numbers, and tool realizations live in `reference.md`, which MUST NOT contain internal project identifiers.

#### Scenario: Cross-stack reuse

- **WHEN** a non-frontend performance workflow loads this skill
- **THEN** the discipline rules apply without modification, and the case archive is consulted only as illustration
