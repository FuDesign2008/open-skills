## MODIFIED Requirements

### Requirement: 工作流测试步骤 SHALL 执行测试基建二分支

工作流执行阶段的测试步骤 MUST 先检测项目测试基建（测试框架配置 / `scripts.test` 等）：**有基建** → 委托 `test-suite-ensure` 补全测试并运行（scope 为本次变更的逻辑文件）；**无基建** → 按一次一问纪律询问用户「是否增加测试基建」，同意则委托 `test-suite-ensure`（含脚手架搭建），不同意则在执行报告中提醒且不阻断流程。MUST NOT 使用「若项目配置了 test-suite-ensure / ensure-tests」之类的错误表述（`test-suite-ensure` 为全局安装 skill）。

#### Scenario: 无测试基建的项目不擅自搭建

- **WHEN** 工作流执行阶段发现变更涉及业务逻辑但项目无任何测试框架配置
- **THEN** 工作流询问用户是否增加测试基建；用户不同意时仅在执行报告中提醒「建议补充单元测试」，流程继续

### Requirement: 工作流调用的 skill SHALL 声明为强依赖

工作流在任一阶段中按指令调用的 skill（含 `test-suite-ensure`、`node-version-discipline`），MUST 声明在其 frontmatter `dependencies` 中并纳入前置 skill 检查（缺失即中止），不得「调用未声明」。

#### Scenario: 阶段 6 调用 ensure-tests 的工作流缺失该 skill 时中止

- **WHEN** 某工作流在测试步骤委托 `test-suite-ensure`，而运行环境未安装它
- **THEN** 该工作流前置检查不通过，启动即中止并提示安装，不做静默降级

#### Scenario: 工作流不再调用 env-capability-discovery

- **WHEN** 工作流已移除可选环境能力探索
- **THEN** 其 `dependencies` MUST NOT list `env-capability-discovery`，且正文 MUST NOT instruct loading that skill

### Requirement: Workflow hosts SHALL thin-ref shared orchestration and gates

PDCA workflows MUST thin-reference `staged-review-flow` (all four) and `opsx-workspace-gate` (opsx pair only) per AGENTS thin-ref rules: load + placeholder map + host-only orchestration. They MUST NOT expand `merge-discipline` Part A–D steps, learn-and-improve four-step lists, clarifying-question long restatements, or node-version probe chains in host bodies.

#### Scenario: Merge hosts drop Part expansions

- **WHEN** Wave 1 completes
- **THEN** `jira-fix-workflow` / `opsx-solve-workflow` / `opsx-jira-fix-workflow` contain at most a one-line pointer to `merge-discipline` Parts A→D, not inline Part bullets

### Requirement: Workflow review stages SHALL NOT embed outdated review blocking lists

After `staged-review-flow` lands, host review sections MUST NOT keep a parallel blocking/non-blocking bullet list that can drift from `solution-review` / `code-design-review`.

#### Scenario: Inline blocking guide removed from opsx-solve

- **WHEN** Wave 2a completes
- **THEN** `opsx-solve-workflow` no longer maintains its own「阻断问题判定指引」list duplicating review skills
