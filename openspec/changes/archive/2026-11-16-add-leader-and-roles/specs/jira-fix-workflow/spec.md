# Spec Delta: jira-fix-workflow

## ADDED Requirements

### Requirement: Design and verify stages SHALL dispatch leader under contract

When a role contract is present, `jira-fix-workflow` MUST dispatch `leader` with `Phase: design` after solution selection and before review, and with `Phase: verify` during Stage 8 role dispatch. Fail-closed acceptance applies to the leader card. When no contract is present, those stages MUST run without role dispatch.

#### Scenario: Verify stage uses leader

- **WHEN** Stage 8 runs and a role contract exists
- **THEN** the host dispatches `leader` with `Phase: verify` instead of inline 8a/8b/8c subordinate dispatch lists

#### Scenario: No contract skips leader on verify

- **WHEN** Stage 8 runs and no role contract exists
- **THEN** the host runs verification checks without dispatching `leader`

## MODIFIED Requirements

### Requirement: Stage 8 SHALL delegate verification execution to runtime-verification-discipline

`jira-fix-workflow` MUST list `runtime-verification-discipline` in frontmatter `dependencies`（缺失即在启动前置检查中止，不静默降级）。Stage 8 检查验证 SHALL 遵循 `runtime-verification-discipline`：由 AI 在环境中按其选层规则与提供者解析亲自执行验证，仅在分类后的真硬边界才交还用户。Host 正文保持薄引用（加载 + 适用条件），不复述该纪律的方法论。

Stage 8 MUST additionally dispatch `leader` with `Phase: verify` when the project provides a role contract. The host MUST fail-closed-accept the leader result card. During role dispatch the stage MUST NOT change production code; `tester` (via leader) MAY add test files. When the project provides no role contract, Stage 8 MUST run the checks above without dispatching roles.

#### Scenario: 可达环境中的修复验证

- **WHEN** Stage 8 验证一个其行为可在 AI 能驱动的环境中检验的修复
- **THEN** Stage 8 由 AI 在该环境中按 `runtime-verification-discipline` 执行验证
- **AND** 不把验证步骤列为「请用户自行运行」

#### Scenario: Missing runtime-verification-discipline aborts startup

- **WHEN** `jira-fix-workflow` starts and `runtime-verification-discipline` is unavailable
- **THEN** the prerequisite check aborts the workflow

#### Scenario: Role dispatch keeps production code untouched

- **WHEN** Stage 8 dispatches `leader` with `Phase: verify` and nested `tester` runs
- **THEN** no production file changes during the stage, and the tester's diff stays within test files

#### Scenario: No role contract falls back to the original checks

- **WHEN** the project provides no role contract
- **THEN** Stage 8 runs the original verification checks without role dispatch

### Requirement: Design-phase SHALL dispatch architect under contract and gate

After solution selection and before `staged-review-flow`, when a role contract is present,
`jira-fix-workflow` MUST dispatch `leader` with `Phase: design` so that `leader` applies
the design-phase architect gate from `agent-role-separation`. The host MUST fail-closed-accept
the leader card. When no contract is present, the host MUST continue without role dispatch.

#### Scenario: Gate fires with contract

- **WHEN** Stage 5 has a selected solution, a role contract exists, and an explicit architecture mark is set
- **THEN** `leader` dispatches `architect` before solution review and the host records the leader result card

#### Scenario: Gate does not fire

- **WHEN** Stage 5 has a selected solution and a role contract exists but no architect gate input matches
- **THEN** `leader` does not auto-dispatch `architect` and the host may still accept a leader PASS for other design-phase work or an empty subordinate set per contract rules

#### Scenario: Architect diff outside design paths is rejected

- **WHEN** `architect` returns PASS but the working-tree diff includes a production file
- **THEN** `leader` rejects that nested result and does not treat design dispatch as passed
