# Spec Delta: agent-role-separation

## Purpose

Defines the role contract for organizer ↔ role dispatch: task/result cards, fail-closed acceptance, model tiers, write boundaries, and opt-in host integration when a contract is present at project or Claude Code user-global paths.

## MODIFIED Requirements

### Requirement: Host integration SHALL be opt-in by presence

PDCA hosts that support role dispatch MUST dispatch only when a role contract exists at the project path `.claude/agents/_contract.md` OR at `~/.claude/agents/_contract.md` (expand `~`). If both exist, the project path wins. If neither exists, hosts run without role dispatch. When enabled, hosts MUST dispatch `leader` for opted-in phases. Agent files MAY be installed by this repo's scripts into `~/.claude/agents/` by copy; they MUST NOT be installed via `npx skills add`.

#### Scenario: User-global contract enables dispatch

- **WHEN** the project has no `_contract.md` but `~/.claude/agents/_contract.md` exists
- **THEN** the host treats the role contract as present and may dispatch `leader` at role boundaries

#### Scenario: Project contract overrides user-global

- **WHEN** both `.claude/agents/_contract.md` and `~/.claude/agents/_contract.md` exist
- **THEN** the host uses only the project contract for dispatch gates and configuration

#### Scenario: No contract keeps the original behavior

- **WHEN** neither project nor user-global `_contract.md` exists
- **THEN** the host runs its original checks without role dispatch

#### Scenario: Contract present uses leader

- **WHEN** a role contract is present (per precedence above) and the host reaches a role-dispatch boundary
- **THEN** the host dispatches `leader` with a `Phase` and does not inline subordinate lists

## ADDED Requirements

### Requirement: Role package install SHALL copy with manifest attribution

Repo scripts MUST copy from `<repoRoot>/.claude/agents/` to `~/.claude/agents/` (not symlink). They MUST record claims in `~/.claude/agents/.open-skills-roles-manifest.json`, prune only stale claimed paths on full sync unless `--no-prune`, and MUST NOT touch foreign agent files. `install-skills.mjs` MUST respect `--no-roles`. Source of truth remains repo `.claude/agents/`.

#### Scenario: Stale claimed role file is pruned

- **WHEN** a file was previously manifest-claimed and is removed from repo `.claude/agents/`
- **THEN** the next full role install deletes only that path under `~/.claude/agents/`

#### Scenario: Foreign agent file survives

- **WHEN** `~/.claude/agents/` contains an agent file never recorded in `.open-skills-roles-manifest.json`
- **THEN** role install and prune leave that file unchanged

#### Scenario: Skill install skips roles with flag

- **WHEN** the user runs `install-skills.mjs` with `--no-roles` and skills install succeeds
- **THEN** no role copy or role manifest update runs

#### Scenario: Default skill install refreshes roles

- **WHEN** the user runs a successful default `install-skills.mjs` without `--no-roles`
- **THEN** role files are copied from the repo `.claude/agents/` tree per the manifest rules