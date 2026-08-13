## RENAMED Requirements

- FROM: `### Requirement: Pre-exec worktree gate with preference resolution`
- TO: `### Requirement: Pre-write worktree gate with preference resolution`

## MODIFIED Requirements

### Requirement: Pre-write worktree gate with preference resolution

Before the first non-trivial persistent write (docs or code) in a PDCA host run, the Agent MUST load `git-worktree-discipline` and resolve `worktree-gate` from `AGENTS.md` / `CLAUDE.md` as `always` | `never` | `ask`. Unset MUST behave as `ask`.

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
