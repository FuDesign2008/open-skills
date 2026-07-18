# opsx-solve-workflow Specification

## Purpose
定义 `opsx-solve-workflow` 的阶段结构契约：与 `solve-workflow` 同构的八阶段 PDCA 流程（阶段 1 明确问题 → 阶段 8 回顾归档），原 1.1/1.2 小节拆分为独立阶段，阶段 0 门禁保留；各阶段名称、顺序与跨阶段引用以本 spec 为准。
## Requirements
### Requirement: opsx-solve-workflow SHALL expose eight sequential phases

`opsx-solve-workflow` SHALL expose eight phases, numbered 1 through 8, with the following semantics:

- Phase 1: 明确问题（Problem Clarification）
- Phase 2: 分析问题（Problem Analysis）
- Phase 3: 探索方案（Solution Exploration）
- Phase 4: 审查方案（Solution Review）
- Phase 5: 制定计划（Plan Formulation）
- Phase 6: 执行计划（Plan Execution）
- Phase 7: 检查验证（Verification）
- Phase 8: 回顾归档（Retrospective & Archive）

#### Scenario: Phase numbering matches solve-workflow

- **WHEN** a user invokes `opsx-solve-workflow`
- **THEN** the skill progresses through phases 1→8 with the same phase names and order as `solve-workflow`

### Requirement: Phase 1 SHALL only perform problem clarification without code exploration

Phase 1 SHALL restate the problem, extract key elements, list clarification questions, and wait for user confirmation. Code exploration is forbidden in Phase 1 except when the user explicitly references a file path, code snippet, or symbol-location pair.

#### Scenario: User describes a vague task

- **WHEN** the user provides a high-level task description without code references
- **THEN** Phase 1 outputs a restatement, key elements, and a single most critical clarifying question
- **AND** Phase 1 does not invoke Read/Grep/SemanticSearch

### Requirement: Phase 2 SHALL perform read-only technical analysis

Phase 2 SHALL perform existence verification, research routing, code location, root-cause analysis, impact assessment, and optional upstream dependency evaluation. All tools in Phase 2 are read-only; analysis-aid temporary changes must be registered and rolled back before exiting Phase 2.

#### Scenario: Static analysis locates the root cause

- **WHEN** Phase 2 is entered after user confirmation in Phase 1
- **THEN** the skill reads relevant files and reports existence verification, root cause, and impact range
- **AND** no implementation edits are made

### Requirement: Phase 3 SHALL present at least two solution options

Phase 3 SHALL generate 2–5 solution options, compare them in a table, and recommend one. In manual mode, the skill SHALL pause and wait for the user to select an option before proceeding.

#### Scenario: Manual mode solution selection

- **WHEN** Phase 3 completes the solution comparison table in manual mode
- **THEN** the skill stops and waits for the user to select a solution
- **AND** does not proceed to Phase 4 until a selection is made

### Requirement: Phase 4 SHALL produce reviewable design decisions

Phase 4 SHALL review the selected solution for effectiveness, side effects, feasibility, spec compliance, and design quality. After passing the review, the skill SHALL create `design.md` via `openspec-continue-change`.

#### Scenario: Review identifies a blocking risk

- **WHEN** Phase 4 review finds an unmitigated medium or high risk
- **THEN** the review conclusion is "不通过" and the skill loops back to optimize the solution

### Requirement: Phase 5 SHALL break work into checkboxed tasks

Phase 5 SHALL produce `tasks.md` with checkboxed tasks small enough to be completed individually, ordered by dependency, and free of non-executable descriptions such as `TBD`, `TODO`, or "类似上面".

#### Scenario: Task list dependencies are explicit

- **WHEN** Phase 5 produces `tasks.md`
- **THEN** each task has a checkbox and the order reflects implementation dependencies

### Requirement: Phase 6 SHALL enforce node-version-discipline before verification commands

Phase 6 SHALL call `node-version-discipline` to align the Node version before running any project-level test, lint, type-check, or build commands, and SHALL disclose the aligned Node version in the verification report.

#### Scenario: Project declares a Node version

- **WHEN** the project contains `.nvmrc` declaring Node 20
- **THEN** Phase 6 runs `nvm use 20` or equivalent before `npm test`
- **AND** the report states `Node(声明版本 v20) ✅`

### Requirement: Phase 7 SHALL archive OpenSpec artifacts before branch finish

Phase 7 SHALL ensure `tasks.md` is complete, delta specs represent the implementation, and main specs are updated. It SHALL call `openspec-archive-change` before any branch-finish decision, and SHALL inspect the resulting diff before concluding.

#### Scenario: Archive succeeds

- **WHEN** Phase 7 verification passes and the user confirms archive
- **THEN** `openspec-archive-change` moves the change to `openspec/changes/archive/`
- **AND** the skill inspects the git diff before any merge/PR decision

