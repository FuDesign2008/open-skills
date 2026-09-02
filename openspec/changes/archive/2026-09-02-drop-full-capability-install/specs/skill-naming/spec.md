## MODIFIED Requirements

### Requirement: Skill renames in this repo SHALL be hard cuts

When a project skill is renamed, the directory, frontmatter `name`, OpenSpec capability folder (when one exists), host `dependencies`, and in-repo textual references MUST all move to the new id in the same change. Compatibility alias directories or dual `name` values MUST NOT be kept.

#### Scenario: Old id has zero in-repo hits after rename

- **WHEN** the rename change is ready to merge
- **THEN** a repository search for the old skill id in `skills/`, `AGENTS.md`, and active OpenSpec specs returns no remaining references (archive history excluded as needed)
