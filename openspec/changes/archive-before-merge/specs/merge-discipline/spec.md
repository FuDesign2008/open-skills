## ADDED Requirements

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

## MODIFIED Requirements

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
