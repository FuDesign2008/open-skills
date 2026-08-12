## ADDED Requirements

### Requirement: Skill id SHALL be git-worktree-discipline

The skill directory and frontmatter `name` MUST be `git-worktree-discipline` (not `workspace-isolation-discipline`, not Superpowers `using-git-worktrees`). Body MUST be English; description MUST include Chinese triggers. Description MUST stay ≤1024 characters and use a single-line quoted string.

#### Scenario: Collision-free name

- **WHEN** the skill is published in open-skills
- **THEN** its `name` is `git-worktree-discipline`
- **AND** no skill directory named `workspace-isolation-discipline` remains

### Requirement: Pre-exec worktree gate with preference resolution

Before the first non-trivial production edit in a PDCA host execute stage, the Agent MUST load `git-worktree-discipline` and resolve `worktree-gate` from `AGENTS.md` / `CLAUDE.md` as `always` | `never` | `ask`. Unset MUST behave as `ask`.

#### Scenario: never skips create

- **WHEN** `worktree-gate: never` is declared
- **THEN** the Agent MUST skip offering/creating a worktree for this run
- **AND** MUST leave a short 留痕 that the gate skipped isolation

#### Scenario: always creates when possible

- **WHEN** `worktree-gate: always` and a suitable isolation path exists (native workspace tool or `git worktree` under ignored `.worktrees/`)
- **THEN** the Agent MUST create or reuse isolation without asking
- **AND** MUST continue the host execute stage inside that workspace when creation succeeds

#### Scenario: ask recommends then asks

- **WHEN** `worktree-gate` is unset or `ask`
- **THEN** the Agent MUST first state a suitability recommendation from project state (multi-repo sibling paths, need for full product pack, dirty tree, etc.)
- **AND** THEN ask the user to create isolation, decline, or lean (continue without)
- **AND** MUST NOT silently create a worktree without that consent under `ask`

### Requirement: Detect existing isolation before create

The skill MUST detect an already-active isolation workspace for the change (native or `.worktrees/`) and reuse it instead of nesting a second worktree by default.

#### Scenario: Reuse active worktree

- **WHEN** the session is already inside a change-scoped worktree or native isolation workspace
- **THEN** the Agent MUST report reuse and skip create

### Requirement: Create path prefers native then git worktree

When creating isolation, the Agent MUST prefer the host Agent's native workspace/worktree capability when available; otherwise use `git worktree` under a gitignored `.worktrees/` path. Creation MUST be recorded for later closeout cleanup.

#### Scenario: Fallback git worktree

- **WHEN** native isolation is unavailable and the repo is a git working tree
- **THEN** the Agent MAY create a worktree under ignored `.worktrees/<branch-or-change-id>/`
- **AND** MUST ensure `.worktrees/` is ignored before adding files there

### Requirement: Suitability guidance for multi-repo and full packs

The skill (SKILL.md and/or reference.md) MUST document that git worktrees are a poor default when the change requires multi-repo sibling relative paths (e.g. `../sibling-repo`) or a full product installer pack that assumes the primary checkout layout, and MUST recommend verifying code + unit tests in the worktree while keeping pack/installer verification on the primary tree or with explicit env rebinding.

#### Scenario: Multi-repo sibling warning in recommendation

- **WHEN** the Agent detects sibling-repo relative path assumptions or a full pack verify intent under `ask`
- **THEN** the recommendation MUST surface that worktree isolation may break those paths unless env/path rebinding is planned

### Requirement: Cleanup ownership stays with feature-branch-closeout

`git-worktree-discipline` owns detect/create/consent. Destruction/cleanup of the isolation workspace MUST be offered by `feature-branch-closeout` (or equivalent closeout), not duplicated as a full create+destroy lifecycle inside this skill alone.

#### Scenario: Create without destroy here

- **WHEN** isolation was created via this skill
- **THEN** the skill MAY note that closeout will offer cleanup
- **AND** MUST NOT require the user to destroy the worktree before continuing execute
