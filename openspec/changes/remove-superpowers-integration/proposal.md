## Why

可选增强挂接（Superpowers 点名 + `env-capability-discovery` 软扫描）不保证调用、与强依赖双轨、浪费 token，且把执行预期建立在「虚」的渐进增强上。宿主应只跑内置流程与 frontmatter 强依赖。

## What Changes

- **BREAKING（行为预期）**：四宿主工作流不再扫描/调用可选环境增强；不再点名 Superpowers skill。
- 从 `solve-workflow`、`opsx-solve-workflow`、`jira-fix-workflow`、`opsx-jira-fix-workflow` 移除 `env-capability-discovery` 依赖、能力→阶段映射、「🔌 若环境探索发现…」类指引，以及 Superpowers 专节/点名调用。
- 删除 `skills/env-capability-discovery/`；主 `openspec/specs/env-capability-discovery` 归档移除对应能力要求。
- 同步 `AGENTS.md` 依赖表、`workflow-contract-sync` 中对 env 的引用、jira-fix `enhanced_capabilities` / clarifying 举例等残留。

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `env-capability-discovery`: **REMOVED** — 取消共享环境能力探索契约；工作流不得再依赖可选增强扫描。
- `workflow-contract-sync`: 去掉「须声明/薄引用 env-capability-discovery」类要求；宿主不得再嵌入 env 方法论或能力映射表。

## Impact

- Skills：四宿主 + 删除 env-capability-discovery；次要：`clarifying-question-discipline` 举例、jira-fix reference state 字段、AGENTS.md、skills-index（hook 生成）。
- Specs：`openspec/specs/env-capability-discovery`、`workflow-contract-sync`。
- 不改：`analysis-core`、`ensure-tests`、`merge-discipline`、原生 OPSX、PDCA 门禁。
