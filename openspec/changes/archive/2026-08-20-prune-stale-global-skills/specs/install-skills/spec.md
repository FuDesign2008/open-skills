## ADDED Requirements

### Requirement: Full installs SHALL prune manifest-claimed stale skills

`scripts/install-skills.mjs`, after a successful full install (`--skill '*'`), MUST remove from every existing global skill root the directories whose names appear in the previous `.open-skills-manifest.json` claim but not in the current repo skill set, then overwrite the manifest with the current set. It MUST NOT remove any directory the manifest never claimed (foreign skills). Partial installs (`--skill <name>`) and `--no-prune` MUST skip both pruning and manifest overwrite. Pruning MUST NOT run when the `skills add` step failed.

#### Scenario: Breaking removal self-heals on next full install

- **WHEN** a skill is deleted from the repo and a user runs a full install
- **THEN** the skill's directory is removed from the global roots the manifest attributed it to, and the manifest reflects the new claim

#### Scenario: Foreign skill survives

- **WHEN** a global root contains a skill installed from another source that shares no manifest claim
- **THEN** a full install leaves that directory untouched

#### Scenario: Partial install does not misjudge

- **WHEN** the script runs with `--skill solve-workflow` while the manifest claims 56 skills
- **THEN** no pruning happens and the manifest keeps its previous content
