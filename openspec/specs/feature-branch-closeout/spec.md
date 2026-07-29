# feature-branch-closeout Specification

## Purpose
Post-verify feature-branch closeout menu; merge delegates to merge-discipline.

## Requirements
### Requirement: feature-branch-closeout SHALL own the post-verify closeout menu

After verification is green (or each failing check is explicitly labeled Pending with required action), `feature-branch-closeout` MUST present a closeout menu before claiming the branch work is finished. Minimum options: **open/update PR**, **merge** (into the protected target), **keep branch**, **continue development**. Hosts MAY add worktree cleanup or discard with explicit confirmation. The skill MUST NOT embed rebase/coverage/tip-pin steps — those remain in `merge-discipline`.

#### Scenario: Menu after green verify

- **WHEN** verification has passed (or pendings are listed) and archive (if any) is done
- **THEN** the agent presents the closeout menu rather than silently ending or merging

#### Scenario: Keep skips merge-discipline

- **WHEN** the user chooses keep branch or continue development
- **THEN** the agent MUST NOT load merge-discipline Parts A–D for a merge

### Requirement: feature-branch-closeout SHALL delegate merge to merge-discipline

When the chosen option is merge (or the user later says merge), the agent MUST load `merge-discipline` and run Parts A→B→C→D before executing the merge. feature-branch-closeout MUST NOT restate those parts inline.

#### Scenario: Merge path loads merge-discipline

- **WHEN** closeout selects merge
- **THEN** `merge-discipline` is loaded and run end-to-end before `gh pr merge` / equivalent

### Requirement: feature-branch-closeout skill identity SHALL avoid external name collisions

The skill directory and frontmatter `name` MUST be `feature-branch-closeout` (not `finishing-a-development-branch`). Body MUST be English; description MUST include Chinese triggers.

#### Scenario: Collision-free name

- **WHEN** the skill is published in open-skills
- **THEN** its `name` is `feature-branch-closeout`
