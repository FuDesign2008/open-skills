# Spec Delta

## MODIFIED Requirements

### Requirement: Stage 8 SHALL delegate verification execution to runtime-verification-discipline

`jira-fix-workflow` MUST list `runtime-verification-discipline` in frontmatter `dependencies`（缺失即在启动前置检查中止，不静默降级）。Stage 8 检查验证 SHALL 遵循 `runtime-verification-discipline`：由 AI 在环境中按其选层规则与提供者解析亲自执行验证，仅在分类后的真硬边界才交还用户。Host 正文保持薄引用（加载 + 适用条件），不复述该纪律的方法论。

Stage 8 MUST additionally dispatch roles when the project provides a role contract: `code-reviewer` at the `standard` tier, `code-reviewer` at the `escalated` tier when an escalation condition holds, and `tester`. The organizer MUST read every result-card field and apply the fail-closed acceptance rules. During role dispatch the stage MUST NOT change production code; `tester` MAY add test files. When the project provides no role contract, Stage 8 MUST run the checks above without dispatching roles.

#### Scenario: 可达环境中的修复验证

- **WHEN** Stage 8 验证一个其行为可在 AI 能驱动的环境中检验的修复
- **THEN** Stage 8 由 AI 在该环境中按 `runtime-verification-discipline` 执行验证
- **AND** 不把验证步骤列为「请用户自行运行」

#### Scenario: Missing runtime-verification-discipline aborts startup

- **WHEN** `jira-fix-workflow` starts and `runtime-verification-discipline` is unavailable
- **THEN** the prerequisite check aborts the workflow

#### Scenario: Role dispatch keeps production code untouched

- **WHEN** Stage 8 dispatches `code-reviewer` and `tester`
- **THEN** no production file changes during the stage, and the tester's diff stays within test files

#### Scenario: No role contract falls back to the original checks

- **WHEN** the project provides no role contract
- **THEN** Stage 8 runs the original verification checks without role dispatch

## ADDED Requirements

### Requirement: Stage 8 permission table SHALL allow tester test-file writes

The stage permission table MUST mark Stage 8 as read-only for production code while
permitting the tester to add test files.

#### Scenario: Permission table matches dispatch

- **WHEN** a reader checks the Stage 8 row of the permission table
- **THEN** it permits test-file writes and forbids production-code writes
