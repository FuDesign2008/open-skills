## Why

合并前覆盖率门控（merge coverage gate）当前只在「分支收尾决策为合并」这一状态触发，但真实场景中用户常直接下达合并指令（"merge MR"、"合并 MR"），跳过分支收尾决策，导致门控被绕过、未验证代码进入主分支。2026-07-22 已发生一次真实事件（markdown-editor MR !450 已合并，门控被绕过无法回退，详见 `docs/merge-coverage-gate-bypass-incident.md`）。需要把「合并动作」本身作为门控触发锚点，并补强触发判断的多个防御层。

## What Changes

- **扩展门控触发锚点**：从「分支收尾决策为合并」扩展为「任何合并动作」（含用户直接下达合并指令的路径），不依赖是否走过分支收尾决策
- **合并命令前置显式提醒**：调用 `glab mr merge` / `gh pr merge` 前 AI 必须自问「是否已运行门控」
- **判定矩阵新增「隐式漏跑」行**：AI 即将合并但未运行门控视为门控未通过，暂停合并补跑；已合并则如实报告漏跑并留痕
- **收紧「未发现 test-coverage-analyzer」降级**：从「静默跳过且不留痕」改为「留痕但不阻断」（避免没装该 skill 的项目每次合并都被打断，同时防止无声漏跑）
- **新增合并前检查清单**：把触发判断散落规则整合为显式清单，AI 执行合并前逐项确认
- **门控规范版本升级**：v1 → v2，三个工作流同步维护
- **门控规范版本号同步**：在三个 reference.md 顶部「门控规范版本」从 v1 升级到 v2，便于未来追溯契约变更

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `workflow-contract-sync`: 在 solve 家族跨工作流同步基线下，新增门控触发锚点、合并命令前置检查、隐式漏跑判定、未发现降级收紧、合并前检查清单五个 requirement 的契约。三个工作流（opsx-solve-workflow / jira-fix-workflow / opsx-jira-fix-workflow）的 reference.md 门控规范与 SKILL.md 摘要同步落地。

## Impact

**涉及文件**（共 6 处 + 三个 frontmatter 版本号）：

| 文件 | 变更类型 |
|------|---------|
| `skills/opsx-solve-workflow/reference.md` | 门控规范 v1 → v2，重写门控触发、前置检测、判定矩阵、新增检查清单 |
| `skills/opsx-solve-workflow/SKILL.md` | 阶段 8 顺序约束与门控小节更新；version PATCH |
| `skills/jira-fix-workflow/reference.md` | 同步门控规范 v1 → v2 |
| `skills/jira-fix-workflow/SKILL.md` | 阶段 10 步骤 2.1 门控小节更新；version PATCH |
| `skills/opsx-jira-fix-workflow/reference.md` | 同步门控规范 v1 → v2 |
| `skills/opsx-jira-fix-workflow/SKILL.md` | 8.4.1 门控小节更新；version PATCH |

**不涉及**：
- `test-coverage-analyzer`：外部 skill（不在本仓库），事件复盘文档建议 6 作为给该 skill 作者的建议留存
- `docs/merge-coverage-gate-bypass-incident.md`：事件复盘文档（本次变更的输入材料，不改）

**向后兼容性**：本次变更仅扩展触发路径，不破坏既有「分支收尾决策为合并 → 触发门控」路径；既有的显式跳过留痕机制、判定矩阵原四行、模式生命周期规则全部保留。
