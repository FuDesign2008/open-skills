## Context

2026-07-22 在 markdown-editor MR !450 发生「合并前覆盖率门控被绕过」事件：用户说「准备 merge MR」，AI 跳过覆盖率门控直接执行 `glab mr merge`，未验证代码进入主分支（详见 `docs/merge-coverage-gate-bypass-incident.md`）。

**当前状态**：三个工作流（`opsx-solve-workflow` / `jira-fix-workflow` / `opsx-jira-fix-workflow`）的门控规范（v1）在各自 reference.md 同步维护（reference.md 第 53 行契约），触发条件锚点过窄——只挂在「分支收尾决策为合并」这一状态上，未覆盖用户直接下达合并指令的常见路径。

**约束**：
- 三个工作流的门控规范必须保持同步（既有契约）
- 向后兼容：不破坏既有「分支收尾决策 → 门控」路径
- 不阻断未装 `test-coverage-analyzer` 的项目（很多项目没装），但必须有留痕防止无声漏跑
- `test-coverage-analyzer` 不在本仓库，事件文档建议 6 无法落地

## Goals / Non-Goals

**Goals**:
- 把「合并动作」本身作为门控触发锚点（独立于分支收尾决策）
- 在合并命令前置加显式提醒
- 区分「显式跳过」与「隐式漏跑」
- 收紧「未发现 skill」的降级（不再静默跳过）
- 提供合并前检查清单
- 三个工作流的 reference.md + SKILL.md 同步落地

**Non-Goals**:
- 修改 `test-coverage-analyzer` skill（外部 skill，不在本仓库）
- 改变既有判定矩阵原四行（达标 / 不达标 / 崩溃 / 无测试代码）
- 改变既有显式跳过留痕机制
- 改变模式生命周期规则
- 修改事件复盘文档（输入材料，不改）

## Decisions

### D1：在 `workflow-contract-sync` capability 下新增 5 个 ADDED requirements

**选择**：复用既有 `workflow-contract-sync` capability（专门管理 solve 家族跨工作流契约同步）。
**替代方案**：新建独立 capability `merge-coverage-gate`。
**理由**：`workflow-contract-sync` 的 Purpose 明确写「solve 家族工作流的共享契约同步基线」，门控规范本就是其契约的一部分。新建独立 capability 会造成契约碎片化，与既有定位重叠。

### D2：降级策略选择「留痕但不阻断」而非「阻断」

**选择**：未发现 `test-coverage-analyzer` skill 时，输出提示+留痕，由用户决定是否继续合并，不强制阻断。
**替代方案 A**：完全静默跳过（v1 现状）——被事件文档建议 4 否决（过于宽松）。
**替代方案 B**：强制阻断，要求用户必须装 skill 才能合并——对未装 skill 的项目过于严苛，打断正常合并流程。
**理由**：留痕可追溯（解决无声漏跑），但不阻断避免了对项目工具链选择的强制约束。

### D3：合并前检查清单放在 reference.md 而非 SKILL.md

**选择**：检查清单作为门控规范的一部分，放在 reference.md（契约源）；SKILL.md 摘要中显式引用。
**替代方案**：在三个 SKILL.md 中各写一份检查清单。
**理由**：避免重复（AGENTS.md 精简原则「规则只写一次」）；reference.md 是契约源，SKILL.md 是摘要+引用，符合既有结构。

### D4：门控规范版本号 v1 → v2

**选择**：在三个 reference.md 顶部「门控规范版本」字段升级到 v2，便于未来追溯契约变更。
**理由**：本次属契约级变更（新增 5 个 requirements + 改写触发条件），版本号升级方便日后审计。

### D5：delta spec 全部使用 ADDED 而非 MODIFIED

**选择**：5 个新 requirements 全部用 `## ADDED Requirements`。
**理由**：现有 `workflow-contract-sync` spec.md 的 6 个 requirements 都不覆盖门控规范，本次属新增而非改写既有 requirement。

## Risks / Trade-offs

- [风险] 「合并动作触发锚点」判定可能误触发：用户说「merge」但实际不是合并意图（如讨论 merge conflict） → 缓解：判定信号要求「上下文为合并意图」，AI 通过上下文判断；宁可多触发一次门控，不可漏跑
- [风险] 检查清单过长，AI 可能机械执行而不理解 → 缓解：清单简短（4 项），每项有明确分支判定；reference.md 配套解释「为什么」
- [风险] 三个工作流同步更新时漏改某处 → 缓解：tasks.md 拆为「先改 reference.md 三处 → 再改 SKILL.md 三处」的原子任务；阶段 7 用 grep 校验三处一致
- [权衡] 留痕但不阻断 vs 强制阻断：选择前者牺牲了部分强制力，换取对未装 skill 项目的兼容性；通过留痕可追溯弥补

## Migration Plan

1. 三个工作流的 reference.md 门控规范 v1 → v2，写入 5 个新 requirements 的契约条款
2. 三个工作流的 SKILL.md 门控小节同步更新摘要 + 引用 reference.md 完整规范
3. 三个工作流的 SKILL.md frontmatter `version` 各自 PATCH 升级
4. 验证：`openspec validate` 通过 + 三处门控规范文本一致（grep 校验）+ AGENTS.md 验证命令通过
5. 不需要数据迁移（纯 skill 文本契约变更）

**回滚策略**：git revert 本次提交即可（无破坏性变更，向后兼容）。

## Open Questions

无（事件文档已提供清晰的方案成型输入）。
