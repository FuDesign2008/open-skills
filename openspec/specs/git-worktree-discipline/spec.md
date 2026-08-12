# git-worktree-discipline Specification

## Purpose
Pre-exec git/native worktree isolation with preference gate and suitability recommendation; cleanup via closeout.

## Requirements
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

The skill MUST detect an already-active isolation workspace for the change (native or `.worktrees/`) and reuse it instead of nesting a second worktree by default. Detection MUST distinguish a git submodule from a linked worktree before concluding that isolation already exists.

#### Scenario: Reuse active worktree

- **WHEN** the session is already inside a change-scoped worktree or native isolation workspace
- **THEN** the Agent MUST report reuse and skip create

#### Scenario: Submodule is not treated as worktree isolation

- **WHEN** `git-dir` differs from `git-common-dir` solely because the cwd is a submodule
- **THEN** the Agent MUST treat the checkout as a normal repo for create/gate purposes (may still create a worktree)

### Requirement: Create path prefers native then git worktree

When creating isolation, the Agent MUST prefer the host Agent's native workspace/worktree capability when available; otherwise use `git worktree` under a project-local ignored directory (prefer `.worktrees/`, else existing `worktrees/`, else default `.worktrees/`). Before adding a git worktree under a project-local directory, the Agent MUST verify the directory is ignored (e.g. `git check-ignore`) and fix `.gitignore` when it is not. Creation MUST be recorded for later closeout cleanup. If creation fails due to permission/sandbox denial, the Agent MUST fall back to working in place with a short 留痕.

#### Scenario: Fallback git worktree

- **WHEN** native isolation is unavailable and the repo is a git working tree
- **THEN** the Agent MAY create a worktree under ignored `.worktrees/<branch-or-change-id>/` (or project `worktrees/` when that is the existing convention)
- **AND** MUST ensure the chosen directory is ignored before adding files there

#### Scenario: Create blocked by sandbox

- **WHEN** `git worktree add` fails with a permission or sandbox denial
- **THEN** the Agent MUST report the failure, continue in the current directory, and leave a short 留痕

### Requirement: Setup and baseline after isolation

After creating isolation (or when reusing an isolated workspace that still lacks dependencies), the Agent MUST run project-appropriate dependency setup when project markers exist, then run a baseline test or verify command when the project has one. A failing baseline MUST be reported to the user with an ask whether to proceed or investigate.

#### Scenario: Baseline fails

- **WHEN** baseline tests or verify fail in the isolated workspace
- **THEN** the Agent MUST report the failures and ask before continuing implementation

#### Scenario: No project test command

- **WHEN** the project has no applicable install or test/verify command
- **THEN** the Agent MAY skip that step and state the skip briefly

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
