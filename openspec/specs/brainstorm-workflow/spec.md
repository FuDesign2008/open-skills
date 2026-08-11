# brainstorm-workflow Specification

## Purpose

Design-to-plan orchestration capability owned by the user-invocable `brainstorm-workflow` skill: thin host over external Superpowers `brainstorming` for collaborative design, then hard handoff into in-repo `solve-workflow` Make a Plan. Complements (does not replace) PDCA bug-analysis hosts.

## Requirements

### Requirement: Repository SHALL provide brainstorm-workflow host skill

The repository MUST provide a `brainstorm-workflow` skill with `user-invocable: true`. The skill directory name and frontmatter `name` MUST be `brainstorm-workflow`. The skill body MUST be English-primary; frontmatter `description` MUST include Chinese trigger phrases and MUST stay within the repository description length limit. The skill MUST NOT vendor Superpowers `brainstorming` source into `skills/`.

#### Scenario: Skill is discoverable as orchestration entry

- **WHEN** an agent or installer lists project skills under `skills/`
- **THEN** `brainstorm-workflow` is present with `user-invocable: true` and a description that routes design-to-plan brainstorming (not full PDCA bug fix)

#### Scenario: External brainstorming is not vendored

- **WHEN** the change is merged
- **THEN** there is no `skills/brainstorming/` directory in this repository that copies Superpowers brainstorming content

### Requirement: Strong dependencies MUST abort when missing

`brainstorm-workflow` MUST declare strong dependencies on external skill `brainstorming` and in-repo skill `solve-workflow` in frontmatter `dependencies`. At startup it MUST verify both are available. If either is missing, it MUST abort immediately with an install hint and MUST NOT silently degrade to a simplified design or plan flow.

#### Scenario: Missing brainstorming aborts

- **WHEN** `brainstorm-workflow` starts and `brainstorming` is not installed
- **THEN** the flow aborts with an install hint for Superpowers / external `brainstorming` and does not continue design dialogue

#### Scenario: Missing solve-workflow aborts

- **WHEN** `brainstorm-workflow` starts and `solve-workflow` is not available
- **THEN** the flow aborts with an in-repo install hint for `solve-workflow` and does not proceed to handoff

### Requirement: Design dialogue MUST delegate to brainstorming with path and terminal overrides

After the prerequisite check passes, `brainstorm-workflow` MUST load and follow Superpowers `brainstorming` for exploring context, clarifying (one question per turn), proposing approaches, sectional design approval, writing the design spec, and spec self-review. Before writing the design document, the host MUST ask the user where to save it and MUST recommend the default path `docs/design/YYYY-MM-DD-<topic>-design.md` (user preference overrides). The host MUST NOT invoke `writing-plans` as the terminal step of the design phase.

#### Scenario: Path prompt before write

- **WHEN** the design has been approved in dialogue and the agent is about to write the spec file
- **THEN** the agent asks for the save path, recommending `docs/design/YYYY-MM-DD-<topic>-design.md`, and writes only after the user confirms or accepts the default

#### Scenario: writing-plans is not the terminal skill

- **WHEN** the written design spec has been user-reviewed and approved
- **THEN** the host does not invoke `writing-plans` and instead proceeds to the solve-workflow handoff contract

### Requirement: Hard handoff to solve-workflow Make a Plan

After the user approves the written design spec, `brainstorm-workflow` MUST hard-handoff by loading `solve-workflow` and entering its「制定计划」/ Make a Plan stage. It MUST treat the approved design file path and a short design summary as inputs for that stage and MUST skip `solve-workflow` stages 1–4 for that handoff. The host itself MUST NOT write business/production code; implementation remains under `solve-workflow` after the user confirms the plan (or auto mode of solve advances).

#### Scenario: Handoff skips solve clarify through review

- **WHEN** the user has approved the written design spec under `brainstorm-workflow`
- **THEN** the agent loads `solve-workflow` at Make a Plan with the design path/summary and does not re-run solve stages 1–4 for the same work item

#### Scenario: Host does not implement production code

- **WHEN** `brainstorm-workflow` is running its own stages before or during handoff setup
- **THEN** it does not modify business/production application code; code changes occur only if the user continues inside `solve-workflow` execution after plan confirmation

### Requirement: Scope boundaries MUST steer bug analysis to solve-workflow

`brainstorm-workflow` description and body MUST state that the skill is for design-oriented feature/behavior shaping. When the user intent is primarily bug root-cause analysis or evidence-driven diagnosis, the skill MUST direct the user to `solve-workflow` or `opsx-solve-workflow` instead of pretending to replace that analysis front half.

#### Scenario: Bug-oriented intent is redirected

- **WHEN** the user invokes `brainstorm-workflow` for a defect whose goal is locating and fixing a root cause in existing code
- **THEN** the skill instructs using `solve-workflow` / `opsx-solve-workflow` rather than running the brainstorming design dialogue as a substitute for analysis-core

### Requirement: Command entry and catalog registration

The repository MUST provide `commands/brainstorm.md` that invokes `brainstorm-workflow` with `disable-model-invocation: true`. `AGENTS.md` MUST list `brainstorm-workflow` in the skill relationship table. `docs/generated/skills-index.md` MUST include the skill after regeneration.

#### Scenario: Command invokes the host

- **WHEN** a user runs the brainstorm command entry
- **THEN** the command file instructs invoking `brainstorm-workflow` and following it exactly

#### Scenario: Catalogs list the skill

- **WHEN** docs generation and AGENTS skill table are updated for this change
- **THEN** `brainstorm-workflow` appears in `docs/generated/skills-index.md` and in the `AGENTS.md` skill dependency overview table
