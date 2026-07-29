# merge-discipline Specification

## Purpose
TBD - created by archiving change extract-merge-discipline-skill. Update Purpose after archive.
## Requirements
### Requirement: Merge action SHALL trigger coverage gate

The merge-discipline skill SHALL be loaded when any merge into a protected branch is imminent — covering branch-closeout decisions that select "merge", direct user merge commands, and AI preparing to call `glab mr merge` / `gh pr merge`. Selecting "keep branch" or "continue development" SHALL NOT trigger the coverage-gate decision. Triggering SHALL mean starting Part C's preference/ask decision; it SHALL NOT imply automatically running `test-coverage-analyzer`.

#### Scenario: User directly issues merge command

- **WHEN** user says "merge MR" / "合并 MR" / "准备合并" without going through branch-closeout decision
- **THEN** merge-discipline loads and starts the Part C coverage-gate decision before the merge command executes

#### Scenario: Branch-closeout decision selects merge

- **WHEN** a workflow's branch-closeout step selects "merge" (not "keep" / "continue")
- **THEN** merge-discipline loads and starts the Part C coverage-gate decision

#### Scenario: Non-merge decision skips gate

- **WHEN** branch-closeout decision is "keep branch" or "continue development"
- **THEN** the coverage gate SHALL NOT trigger

### Requirement: Coverage gate SHALL honor project preference then per-merge ask

Before running `test-coverage-analyzer`, Part C SHALL resolve a project coverage preference by scanning `AGENTS.md` then `CLAUDE.md` (first match wins) for an explicit `coverage-gate:` value of `always`, `never`, or `ask`. If no declaration is found, the preference SHALL be treated as `ask`.

- **`always`**: run the gate script path without asking (subject to analyzer availability rules).
- **`never`**: skip the analyzer, write a project-preference skip 留痕, and proceed to tip pinning.
- **`ask`**: on every merge, ask the user whether to run coverage or skip this merge; MUST NOT auto-run. Skip requires user-explicit skip 留痕 before Part D.

#### Scenario: Unset preference asks every merge

- **WHEN** merge is imminent and neither `AGENTS.md` nor `CLAUDE.md` declares `coverage-gate:`
- **THEN** the agent asks whether to run or skip coverage for this merge and does not start the analyzer until the user chooses run

#### Scenario: Project preference never skips without asking

- **WHEN** `AGENTS.md` or `CLAUDE.md` declares `coverage-gate: never`
- **THEN** Part C skips the analyzer, writes project-preference skip 留痕, and proceeds to tip pinning without asking

#### Scenario: Project preference always runs when analyzer exists

- **WHEN** preference is `always` and `test-coverage-analyzer` is available
- **THEN** Part C runs the gate script with constructed `--base` without asking

#### Scenario: User chooses skip under ask preference

- **WHEN** preference is `ask` and the user chooses to skip coverage for this merge
- **THEN** Part C writes user-explicit skip 留痕 and proceeds to tip pinning without running the analyzer

### Requirement: Coverage gate SHALL detect test-coverage-analyzer availability

After the preference/ask decision resolves to **run**, the skill SHALL scan the environment for `test-coverage-analyzer`. If found, run the gate script with a constructed `--base` (target branch from MR/PR metadata). If not found, write an environment-miss留痕 and let the user decide whether to proceed. If the decision resolved to **skip**, this availability scan and script run SHALL NOT be required.

#### Scenario: Coverage analyzer available and passing

- **WHEN** the user or preference selected run, test-coverage-analyzer is detected, and coverage meets threshold
- **THEN** proceed to tip-pinning discipline

#### Scenario: Coverage analyzer unavailable

- **WHEN** the user or preference selected run and test-coverage-analyzer is not detected in environment
- **THEN** write environment-miss留痕 (timestamp + "system: env gap") and present to user for decision

#### Scenario: Coverage below threshold or script crash

- **WHEN** coverage is below threshold, or script crashes, or no report, or no test code
- **THEN** pause merge and present report to user for decision (force-merge / add tests / abort)

#### Scenario: Skip decision does not require analyzer

- **WHEN** preference is `never` or the user chose skip under `ask`
- **THEN** Part C proceeds to tip pinning without requiring `test-coverage-analyzer` to be present

### Requirement: Tip pinning SHALL prevent stale-tip merge race

After the coverage gate passes and before the merge command executes, the skill SHALL pin the merge revision to the just-pushed tip, preventing the race where a merge fast-forwards to a pre-push tip while freshly-pushed commits stay on the source branch.

#### Scenario: Pin merge revision with --sha

- **WHEN** the source branch tip was just pushed and is ready to merge
- **THEN** compute `MERGE_SHA=$(git rev-parse origin/<source-branch>)` and merge with `glab mr merge <id> --sha "$MERGE_SHA" -y` (GitLab) or `gh pr merge <id> --sha "$MERGE_SHA"` (GitHub)

#### Scenario: Platform CLI lacks --sha support

- **WHEN** the platform CLI does not support `--sha`
- **THEN** wait for the just-pushed tip's pipeline to pass before merging, and treat the post-merge ancestor check as the mandatory backstop

### Requirement: OpenSpec archive association gate SHALL run before merge Parts B–D

When a merge into a protected branch is imminent (workflow branch-closeout selecting merge, direct user merge command, or AI preparing `glab mr merge` / `gh pr merge`), `merge-discipline` MUST first determine whether the current branch/PR is **associated** with an active OpenSpec change. Association is true if either: (1) the PR or branch diff includes paths under `openspec/changes/<name>/` that are not under `openspec/changes/archive/`, or (2) a session-bound OpenSpec change name still appears in `openspec list` as active. If not associated, the gate MUST pass through to Part B without requiring archive. If associated and the change is still active, the skill MUST **block** the merge, report the active change name(s), and require archive (specs sync + move to `openspec/changes/archive/`) on the same source tip before Parts B→C→D may continue. The gate MUST NOT be implicitly skipped when the user issues a direct merge command.

#### Scenario: Associated active change blocks merge

- **WHEN** the user says "merge MR" and the PR diff still contains `openspec/changes/archive-before-merge/` (active, not archived)
- **THEN** merge-discipline blocks merge, names the active change, and does not run Part B/C/D or the merge command until archive completes on that tip

#### Scenario: Unassociated PR passes through

- **WHEN** a merge is requested and neither the PR/branch diff nor the session-bound change list indicates an active OpenSpec change
- **THEN** the archive gate passes through and Part B (rebase pre-check) runs next

#### Scenario: Direct merge command cannot skip the gate

- **WHEN** the user issues "merge MR" / "合并" without going through workflow stage 8
- **THEN** merge-discipline still runs the OpenSpec archive association gate before Parts B→C→D

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

The skill SHALL default to Strategy A (same-MR pinned-tip merge: archive + main fix in one MR, run all tip-pinning steps). Strategy B (separate docs MR for archive after the implementation MR already merged) MUST NOT be presented as a recommended or default path when the merge attempt is still associated with an active OpenSpec change — that case MUST use the archive association gate (block until archive is on the same tip). Strategy B MAY only be used as **recovery** after an accidental merge that left archive pending, with explicit 留痕 listing "archive pending !N", and MUST never pretend archive is already on the target branch.

#### Scenario: Default same-MR strategy

- **WHEN** the MR is open, the main fix is mergeable, and any associated OpenSpec change is already archived (or there is no association)
- **THEN** use Strategy A: pin tip and merge archive + main fix in the same MR, executing all tip-pinning steps

#### Scenario: Associated active change must not use Strategy B as recommended path

- **WHEN** merge is requested and an associated OpenSpec change is still active
- **THEN** the skill blocks via the archive association gate and does not recommend opening a separate post-merge archive MR as the primary path

#### Scenario: Recovery-only separate-MR strategy

- **WHEN** the implementation MR was already merged accidentally and archive is still pending
- **THEN** Strategy B MAY open a separate docs MR for archive with explicit "archive pending !N" 留痕, without claiming specs are already on the target

### Requirement: merge-discipline SHALL compose with feature-branch-closeout without owning the menu

`merge-discipline` MUST remain the single source for Parts A–D on protected-branch merges. When a host uses `feature-branch-closeout`, that skill owns the closeout **menu** and non-merge paths; `merge-discipline` MUST apply only after merge is selected (or on a direct user merge command). merge-discipline MUST NOT redefine the full closeout option list.

#### Scenario: Menu then merge

- **WHEN** feature-branch-closeout selects merge
- **THEN** merge-discipline runs A→B→C→D and does not present a competing full closeout menu

#### Scenario: Direct merge still uses merge-discipline

- **WHEN** the user issues a direct merge command without going through closeout
- **THEN** merge-discipline still loads (unchanged existing requirement)
