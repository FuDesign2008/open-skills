## MODIFIED Requirements

### Requirement: 工作流调用的 skill SHALL 声明为强依赖

工作流在任一阶段中按指令调用的 skill（含 `ensure-tests`、`node-version-discipline`），MUST 声明在其 frontmatter `dependencies` 中并纳入前置 skill 检查（缺失即中止），不得「调用未声明」。

#### Scenario: 阶段 6 调用 ensure-tests 的工作流缺失该 skill 时中止

- **WHEN** 某工作流在测试步骤委托 `ensure-tests`，而运行环境未安装它
- **THEN** 该工作流前置检查不通过，启动即中止并提示安装，不做静默降级

#### Scenario: 工作流不再调用 env-capability-discovery

- **WHEN** 工作流已移除可选环境能力探索
- **THEN** 其 `dependencies` MUST NOT list `env-capability-discovery`，且正文 MUST NOT instruct loading that skill

### Requirement: Jira fix hosts SHALL thin-reference merge and env discovery

`jira-fix-workflow` and `opsx-jira-fix-workflow` MUST NOT embed full `merge-discipline` Part C/D step lists or Red Flag catalogs that duplicate that skill; they MUST keep at most a one-line load pointer plus host order constraints (e.g. writeback after merge, archive-before-merge for opsx). They MUST NOT restate optional environment-capability discovery methodology or maintain a capability-to-stage enhancement mapping table.

#### Scenario: merge Red Flags removed from host

- **WHEN** an agent reads Red Flags near merge in either Jira host after this change
- **THEN** coverage/tip/archive merge pitfalls are directed to `merge-discipline`, not duplicated as multi-bullet host catalogs

#### Scenario: Jira host has no env enhancement mapping

- **WHEN** an agent reads `jira-fix-workflow` or `opsx-jira-fix-workflow` preamble
- **THEN** there is no capability→stage table or load note for `env-capability-discovery`

## ADDED Requirements

### Requirement: Hosts MUST NOT orchestrate optional enhancement discovery

`solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, and `opsx-jira-fix-workflow` MUST run on built-in stages and frontmatter strong dependencies only. They MUST NOT instruct scanning for optional enhancement skills (including Superpowers-branded skills) and MUST NOT list third-party enhancement skill names as progressive hooks.

#### Scenario: Opsx-solve has no Superpowers section

- **WHEN** an agent loads `opsx-solve-workflow`
- **THEN** the skill has no Superpowers progressive-enhancement table and no “scan Superpowers skills” startup step
