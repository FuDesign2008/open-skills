# merge-discipline Delta Spec

## ADDED Requirements

### Requirement: Part D SHALL run a squash decision step before the merge command

After Part R passes and before any merge command executes, merge-discipline MUST run a squash decision step: (1) list the MR/PR's commits, (2) classify commit quality, (3) present a recommendation — squash or no-squash — with rationale, and (4) obtain explicit user confirmation of the merge strategy. The step MUST NOT be skipped on a direct merge command, and MUST NOT auto-select a strategy on the user's behalf. Tip-pinning semantics are unchanged by this step.

Recommendation semantics MUST be dynamic, based on the MR's commit history:
- Atomic commits with individual value (feature + reviewable enhancement + archive as separate meaningful commits) → recommend **no-squash** (merge commit preserves history).
- Trivial accumulation (fixup / typo / wip / CI-retry noise, intermediate states without standalone value) → recommend **squash**.
- A source branch that will continue to receive development → lean **no-squash** (squashing cuts the commit graph shared with the target and breeds conflicts on later merges), regardless of commit tidiness.

The step MUST be platform-neutral: GitHub executes via `gh pr merge <id> --merge|--squash --match-head-commit "$MERGE_SHA"`; GitLab executes via `glab mr merge <id> [--squash] --sha "$MERGE_SHA"`; platforms without squash support fall back to their available merge methods with the gap stated.

#### Scenario: Atomic commit history recommends no-squash

- **WHEN** Part D lists the MR commits and they are atomic with individual value (e.g. skill creation, enhancement, archive as three separate commits)
- **THEN** the recommendation is no-squash (merge commit), the user confirms, and the merge executes with the platform's merge-commit method with the tip pinned

#### Scenario: Trivial accumulation recommends squash

- **WHEN** the MR commits are trivial accumulation (fixup / typo / wip / CI-retry noise without standalone value)
- **THEN** the recommendation is squash, the user confirms, and the merge executes with the platform's squash method with the tip pinned

#### Scenario: Continuing-development branch leans no-squash

- **WHEN** the source branch will continue to receive development after this merge (even if commits look tidy)
- **THEN** the recommendation leans no-squash, citing that squashing cuts the commit graph shared with the target and breeds conflicts on later merges

#### Scenario: Direct merge command cannot skip the decision

- **WHEN** the user issues a direct "merge MR" command without going through a workflow closeout
- **THEN** Part D still runs the squash decision step before executing the merge command

#### Scenario: User overrides the recommendation

- **WHEN** the recommendation is no-squash but the user explicitly chooses squash (or vice versa)
- **THEN** the user's explicit choice wins, the merge executes with the chosen strategy, and tip pinning still applies

#### Scenario: Platform without squash support

- **WHEN** the hosting platform's CLI offers no squash merge method
- **THEN** the step still presents the commit-quality assessment, states the platform gap, and merges with the available method
