## ADDED Requirements

### Requirement: OPSX workflows SHALL locate OpenSpec project root before directory checks

`openspec-workspace-gates` MUST define a deterministic project-root location priority (cwd with `openspec/` → walk up from current edit file → scan cwd children → fail with stop message). Opsx workflows (`opsx-solve-workflow` / `opsx-jira-fix-workflow`) MUST load this skill for that gate and MUST NOT each maintain a divergent full copy of the locate algorithm.

#### Scenario: Workspace multi-project locate

- **WHEN** cwd has no `openspec/` but exactly one child directory does
- **THEN** the gate sets project root to that child and continues; if multiple children match, it lists candidates and waits for user selection

### Requirement: OPSX workflows SHALL require openspec directory and exact native skill names

After root location, the gate MUST verify `openspec/` exists and MUST verify the exact native OPSX skill names (`openspec-new-change`, `openspec-continue-change`, `openspec-apply-change`, `openspec-archive-change`) are present. Alternate or legacy names MUST NOT count as pass. Missing any required skill MUST stop with install/`openspec update` guidance.

#### Scenario: Legacy skill name does not pass

- **WHEN** only an old name such as `openspec-propose` is found
- **THEN** the gate fails; the agent MUST NOT hand-write artifacts as a fallback

### Requirement: Hosts SHALL keep non-gate orchestration local

Jira/Git/`--retry` change binding, stage ordering, and artifact sinks remain in host workflows. `openspec-workspace-gates` MUST NOT absorb those concerns.

#### Scenario: opsx-jira keeps retry binding in host

- **WHEN** `opsx-jira-fix-workflow` binds a change via `--retry` or session state
- **THEN** that binding logic stays in the host; only locate + openspec dir + OPSX skill checks come from the shared gate skill
