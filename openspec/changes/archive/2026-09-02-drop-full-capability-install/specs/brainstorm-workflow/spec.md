## MODIFIED Requirements

### Requirement: Command entry and catalog registration

`AGENTS.md` MUST list `brainstorm-workflow` in the skill relationship table. `docs/generated/skills-index.md` MUST include the skill after regeneration. The repository MUST NOT require a repo-root `commands/brainstorm.md` slash-command file.

#### Scenario: Catalogs list the skill

- **WHEN** docs generation and AGENTS skill table are updated for this change
- **THEN** `brainstorm-workflow` appears in `docs/generated/skills-index.md` and in the `AGENTS.md` skill dependency overview table
