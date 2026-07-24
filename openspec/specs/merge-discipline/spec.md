# merge-discipline Specification

## Purpose
TBD - created by archiving change extract-merge-discipline-skill. Update Purpose after archive.
## Requirements
### Requirement: Merge action SHALL trigger coverage gate

The merge-discipline skill SHALL be loaded when any merge into a protected branch is imminent — covering branch-closeout decisions that select "merge", direct user merge commands, and AI preparing to call `glab mr merge` / `gh pr merge`. Selecting "keep branch" or "continue development" SHALL NOT trigger the gate.

#### Scenario: User directly issues merge command

- **WHEN** user says "merge MR" / "合并 MR" / "准备合并" without going through branch-closeout decision
- **THEN** merge-discipline loads and runs the coverage gate before the merge command executes

#### Scenario: Branch-closeout decision selects merge

- **WHEN** a workflow's branch-closeout step selects "merge" (not "keep" / "continue")
- **THEN** merge-discipline loads and runs the coverage gate

#### Scenario: Non-merge decision skips gate

- **WHEN** branch-closeout decision is "keep branch" or "continue development"
- **THEN** the coverage gate SHALL NOT trigger

### Requirement: Coverage gate SHALL detect test-coverage-analyzer availability

The skill SHALL scan the environment for `test-coverage-analyzer`. If found, run the gate script with a constructed `--base` (target branch from MR/PR metadata). If not found, write an environment-miss留痕 and let the user decide whether to proceed.

#### Scenario: Coverage analyzer available and passing

- **WHEN** test-coverage-analyzer is detected and coverage meets threshold
- **THEN** proceed to tip-pinning discipline

#### Scenario: Coverage analyzer unavailable

- **WHEN** test-coverage-analyzer is not detected in environment
- **THEN** write environment-miss留痕 (timestamp + "system: env gap") and present to user for decision

#### Scenario: Coverage below threshold or script crash

- **WHEN** coverage is below threshold, or script crashes, or no report, or no test code
- **THEN** pause merge and present report to user for decision (force-merge / add tests / abort)

### Requirement: Tip pinning SHALL prevent stale-tip merge race

After the coverage gate passes and before the merge command executes, the skill SHALL pin the merge revision to the just-pushed tip, preventing the race where a merge fast-forwards to a pre-push tip while freshly-pushed commits stay on the source branch.

#### Scenario: Pin merge revision with --sha

- **WHEN** the source branch tip was just pushed and is ready to merge
- **THEN** compute `MERGE_SHA=$(git rev-parse origin/<source-branch>)` and merge with `glab mr merge <id> --sha "$MERGE_SHA" -y` (GitLab) or `gh pr merge <id> --sha "$MERGE_SHA"` (GitHub)

#### Scenario: Platform CLI lacks --sha support

- **WHEN** the platform CLI does not support `--sha`
- **THEN** wait for the just-pushed tip's pipeline to pass before merging, and treat the post-merge ancestor check as the mandatory backstop

### Requirement: Pipeline succeeded signal SHALL be verified against current tip

The skill SHALL NOT trust an instantly-appearing "Pipeline succeeded" after a fresh push, because it is almost certainly the old tip's green result (the new tip's CI cannot finish in seconds).

#### Scenario: Instant Pipeline succeeded after push

- **WHEN** a new commit was pushed just before merge and "Pipeline succeeded" appears immediately
- **THEN** verify the result's sha equals the just-pushed tip, or rely on `--sha` to let the platform enforce the match

### Requirement: Post-merge ancestor check SHALL be mandatory

After the merge command completes, the skill SHALL verify the pinned SHA is an ancestor of the target branch. A MISSING result means freshly-pushed commits did not enter the target.

#### Scenario: Ancestor check passes

- **WHEN** `git merge-base --is-ancestor "$MERGE_SHA" origin/<target>"` returns OK
- **THEN** proceed to Jira writeback / completion

#### Scenario: Ancestor check fails (MISSING)

- **WHEN** the ancestor check returns MISSING
- **THEN** do NOT claim completion or proceed to Jira writeback; open a backfill MR (cherry-pick missing commits) or pause for user decision

### Requirement: Dual-strategy fallback SHALL handle merge race risk

The skill SHALL default to Strategy A (same-MR pinned-tip merge: archive + main fix in one MR, run all tip-pinning steps). When the MR is already merged or tip-race risk is high, the skill SHALL fall back to Strategy B (separate docs MR for archive), explicitly listing "archive pending !N" and never pretending archive is already on the target branch.

#### Scenario: Default same-MR strategy

- **WHEN** the MR is open and the main fix is mergeable
- **THEN** use Strategy A: pin tip and merge archive + main fix in the same MR, executing all tip-pinning steps

#### Scenario: Fallback to separate-MR strategy

- **WHEN** the MR is already merged or tip-race risk is high
- **THEN** use Strategy B: open a separate docs MR for archive, explicitly listing "archive pending !N"

