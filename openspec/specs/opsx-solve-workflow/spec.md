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

### Requirement: Phase 7 SHALL enforce node-version-discipline before verification commands

Phase 7 SHALL call `node-version-discipline` to align the Node version before running any project-level test, lint, type-check, or build commands, and SHALL disclose the aligned Node version in the verification report.

#### Scenario: Project declares a Node version

- **WHEN** the project contains `.nvmrc` declaring Node 20
- **THEN** Phase 7 runs `nvm use 20` or equivalent before `npm test`
- **AND** the report states `Node(声明版本 v20) ✅`

### Requirement: Phase 8 SHALL archive OpenSpec artifacts before branch finish

Phase 8 SHALL ensure `tasks.md` is complete, delta specs represent the implementation, and main specs are updated. It SHALL call `openspec-archive-change` before any branch-finish decision, and SHALL inspect the resulting diff before concluding.

#### Scenario: Archive succeeds

- **WHEN** Phase 8 verification passes and the user confirms archive
- **THEN** `openspec-archive-change` moves the change to `openspec/changes/archive/`
- **AND** the skill inspects the git diff before any merge/PR decision

### Requirement: opsx-solve-workflow SHALL strong-depend on figma-pixel implement and verify

`opsx-solve-workflow` MUST list both `figma-pixel-implement` and `figma-pixel-verify` in frontmatter `dependencies`. At startup prerequisite check, a missing either skill MUST abort (no silent degrade). Phase 6 MUST load `figma-pixel-implement` when Figma URL/node or pixel-restore / design-faithful UI intent is in scope. Phase 7 MUST load `figma-pixel-verify` when this run implemented from Figma or the user/plan requires alignment checking. Host prose MUST stay thin (load + scope conditions) and MUST NOT duplicate the Figma skills' methodology.

#### Scenario: Missing pair aborts opsx-solve startup

- **WHEN** `opsx-solve-workflow` loads and either Figma pixel skill is unavailable
- **THEN** the workflow aborts with a missing-dependency notice before stage 0 continues

#### Scenario: Phase 6 Figma UI work loads implement

- **WHEN** Phase 6 executes a plan that implements UI from a Figma node
- **THEN** the host loads `figma-pixel-implement` and follows that skill for assets and design-spec table

### Requirement: Phase 7 SHALL delegate verification execution to runtime-verification-discipline

`opsx-solve-workflow` MUST list `runtime-verification-discipline` in frontmatter `dependencies`（缺失即在启动前置检查中止，不静默降级）。Phase 7 检查验证 SHALL 遵循 `runtime-verification-discipline`：由 AI 在环境中按其选层规则与提供者解析亲自执行验证，仅在分类后的真硬边界才交还用户。原「AI cannot execute → tell the user to run it yourself」的默认二分被本纪律取代。Host 正文保持薄引用（加载 + 适用条件），不复述该纪律的方法论。

#### Scenario: 可达环境中的行为改动验证

- **WHEN** Phase 7 验证一个其行为可在 AI 能驱动的环境中检验的改动
- **THEN** Phase 7 由 AI 在该环境中按 `runtime-verification-discipline` 执行验证
- **AND** 不把验证步骤列为「请用户自行运行」

#### Scenario: 缺失 runtime-verification-discipline 时启动中止

- **WHEN** `opsx-solve-workflow` 启动前置检查发现 `runtime-verification-discipline` 不可用
- **THEN** 工作流在阶段 0 之后中止并提示安装

