## Why

四个 PDCA 引擎（`solve-workflow` / `opsx-solve-workflow` / `jira-fix-workflow` / `opsx-jira-fix-workflow`）作为 queue child 且卡片 `Stage-exit policy: ai-proxy` 时已经能按 `ai-proxy-discipline` 占位；独立唤起时即使用户明确说「ai-proxy 模式」，模式检测只认自动/手动，纪律与 spec 还要求 queue-child 合取，因此无法走代理停点。需要补上独立 opt-in：可发现的触发/切换、有界薄冻结、然后占位——同时保持「lifecycle 管何时推进、纪律管谁坐停点」的分层，不删除 `ai-proxy-discipline`，不把章程并进 lifecycle。

## What Changes

- **`ai-proxy-discipline`**：激活条件改为本次 run contract / 任务卡上的 `Stage-exit policy: ai-proxy`（来源可以是队列 interaction-budget **或** 独立薄冻结）。去掉「必须是 queue child」合取。新增独立薄冻结清单（对话内输出即为本次 run contract，不另建文件）。presence tier 1：显式 opt-in 且冻结完成后允许占位；冻结过程仍由在场真人完成。章程、reserved list、对抗协议不搬家。
- **`workflow-mode-lifecycle`**：增加 ai-proxy overlay 的识别、中途切换、完成/中断回手动并清除 overlay、批量子调用显式传递 policy。实现仍是 auto 载体 + policy 占位，**不是**与手动/自动并列的第三控制流枚举。未在 description 列出 ai-proxy 触发词的宿主（如 `write-workflow`）MUST 忽略 overlay。
- **四个 PDCA 宿主**：description 增加中英触发词（「ai-proxy 模式」「AI 代理模式」「切换 ai-proxy」 / "ai-proxy mode"、"switch to ai-proxy"）；Unattended 段改为薄指针（policy=ai-proxy → 按纪律占位）。jira / opsx-jira 的 PR-open、archive+PR-open 终点仍仅在显式 `queue-child` 时生效，与代理解耦。
- **不改** `goal-driven-workflow` 正文；**不删** `skills/ai-proxy-discipline/`；**不把** `write-workflow` 拖进代理路径。

## Capabilities

### New Capabilities

（无。独立 opt-in 是现有 `ai-proxy` 与 `workflow-mode-lifecycle` 的行为扩展，不新开 capability。）

### Modified Capabilities

- `ai-proxy`: PDCA 出口接线不再要求 queue-child 合取；宿主接线的 policy 来源包含独立薄冻结；新增独立 opt-in 薄冻结与在场显式授权例外。
- `workflow-mode-lifecycle`: 增加 overlay 识别/切换/回退/批量传递，以及「未声明触发词的宿主 inert」；核心两态回退规则保持。

## Impact

- Skills：`ai-proxy-discipline`（SKILL + reference 模板）、`workflow-mode-lifecycle`、四个 PDCA `SKILL.md` description 与 Unattended/queue-child 段；`docs/generated/skills-index.md`。
- Specs：`openspec/specs/ai-proxy/spec.md`、`openspec/specs/workflow-mode-lifecycle/spec.md`（归档后）。
- 不改 `write-workflow` / `goal-driven-workflow` 正文。`goal-driven-batch` 已有三值 policy 传播，本 change 不要求改队列 SKILL，除非实现时发现 lifecycle 批量条款与现文冲突（冲突则最小对齐，不改传播语义）。
- 无运行时 API / 包依赖变化。description 必须保持 ≤1024 字符（纪律 description 已偏长：冻结清单进正文/reference，不塞 frontmatter）。
