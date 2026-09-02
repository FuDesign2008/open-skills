# skill-naming Specification

## Purpose

Behavioral rules for how project skills in this repository MUST be named: role taxonomy, `opsx-` vs native `openspec-*`, ban on new `pdca-*` skill ids, and hard-cut rename discipline.

## Requirements

### Requirement: Project skills SHALL follow the role-based naming taxonomy

Project skills under `skills/` MUST use kebab-case directory names that match frontmatter `name`, and MUST pick a name that reflects role using the repo taxonomy (at minimum distinguishing: `-workflow` hosts, `-discipline` hard rules, `-gate` pass/fail checkpoints, `-toolkit` tool guidance, `-lifecycle` mode/state contracts, `-kb` knowledge bases, verb-phrase utilities without a role suffix). New project skill ids MUST NOT use the `pdca-` prefix. New project skills that are OpenSpec-flavored hosts or OpenSpec workspace gates for this repo MUST use the `opsx-` prefix, not `openspec-`.

#### Scenario: Reject new pdca- project skill id

- **WHEN** an author proposes a new project skill whose directory/`name` starts with `pdca-`
- **THEN** the change is rejected; a non-`pdca-` name aligned to the taxonomy MUST be chosen instead

#### Scenario: Project OpenSpec gate uses opsx- prefix

- **WHEN** a project-owned OpenSpec locate/native-skill gate skill is added or renamed
- **THEN** its id uses `opsx-` (e.g. `opsx-workspace-gate`) and MUST NOT introduce a new `openspec-*` project skill id

### Requirement: Native OpenSpec CLI skills SHALL keep openspec- ids

Upstream/native OpenSpec skills (e.g. `openspec-new-change`, `openspec-continue-change`, `openspec-apply-change`, `openspec-archive-change`) MUST keep their `openspec-*` names. Project gates that verify native skills MUST continue to require those exact names and MUST NOT treat `opsx-*` aliases as satisfying the native-skill gate.

#### Scenario: Native name still required after project gate rename

- **WHEN** the project gate skill is named `opsx-workspace-gate`
- **THEN** it still fails closed unless the exact native `openspec-*` skills are installed

### Requirement: Skill renames in this repo SHALL be hard cuts

When a project skill is renamed, the directory, frontmatter `name`, OpenSpec capability folder (when one exists), host `dependencies`, and in-repo textual references MUST all move to the new id in the same change. Compatibility alias directories or dual `name` values MUST NOT be kept.

#### Scenario: Old id has zero in-repo hits after rename

- **WHEN** the rename change is ready to merge
- **THEN** a repository search for the old skill id in `skills/`, `AGENTS.md`, and active OpenSpec specs returns no remaining references (archive history excluded as needed)
