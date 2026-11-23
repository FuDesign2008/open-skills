# Spec Delta: install-skills

## MODIFIED Requirements

### Requirement: Full installs SHALL prune manifest-claimed stale skills

After a successful full install (`--skill '*'`), `scripts/install-skills.mjs` MUST remove from every existing global skill root the directories claimed in the previous `.open-skills-manifest.json` but absent from the current repo skill set, then overwrite the manifest with the current set. Pruning MUST NOT run when the `skills add` step failed.

#### Scenario: Breaking removal self-heals on next full install

- **WHEN** a skill is deleted from the repo and a user runs a full install
- **THEN** the skill's directory is removed from the global roots the manifest attributed it to, and the manifest reflects the new claim

## ADDED Requirements

### Requirement: Skill prune SHALL spare foreign and partial installs

The install helper MUST NOT remove any directory the manifest never claimed (foreign skills). Partial installs (`--skill <name>`) and `--no-prune` MUST skip both pruning and manifest overwrite.

#### Scenario: Foreign skill survives

- **WHEN** a global root contains a skill installed from another source that shares no manifest claim
- **THEN** a full install leaves that directory untouched

#### Scenario: Partial install does not misjudge

- **WHEN** the script runs with `--skill solve-workflow` while the manifest claims 56 skills
- **THEN** no pruning happens and the manifest keeps its previous content

### Requirement: Successful skill installs SHALL refresh roles by default

After a successful skills install, `scripts/install-skills.mjs` MUST invoke role install (`installRoles` / `scripts/install-roles.mjs`) unless `--no-roles` is set. When role install runs, role prune MUST follow the same `--no-prune` flag for that run. Role install MUST NOT run when the skills install step failed.

#### Scenario: Default skill install refreshes roles

- **WHEN** the user runs a successful default `install-skills.mjs` without `--no-roles`
- **THEN** role files are copied from the repo `.claude/agents/` tree per the role manifest rules

#### Scenario: Skill install skips roles with flag

- **WHEN** the user runs `install-skills.mjs` with `--no-roles` and skills install succeeds
- **THEN** no role copy or role manifest update runs
