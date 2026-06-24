---
name: opsx-jira-fix-batch
version: "1.2.0"
user-invocable: true
category: development
tags: [jira, openspec, batch, workflow]
description: 当用户说「opsx 批量修复」「批量 opsx-jira-fix」「opsx-jira-fix-batch」「批量 OpenSpec Jira 修复」时触发。适用于需要对多个 Jira issue 进行批量端到端修复并将关系判断沉淀到 OpenSpec artifacts 的编排场景。
---

# OPSX Jira Bug 批量修复

> 本 skill 负责多 issue 批量修复的编排规则（OpenSpec 版本）。单个 issue 的端到端修复流程（阶段 0～7）由 `opsx-jira-fix-workflow` skill 承担；本 skill 的职责是：将多个 issue 拆分为独立任务、识别 issue 间关系、依次调用 `opsx-jira-fix-workflow`、确保关系判断沉淀到 OpenSpec artifacts。
>
> **本 skill 内容仅在用户明确请求批量修复时生效，不在 skill 加载时自动触发任何编排行为。**
>
> 与普通 `jira-fix-batch` 不同，批量关系判断必须沉淀到 OpenSpec artifacts，不能只保留在临时进度文档或对话上下文中。

## 批量编排职责

1. 将输入的 Jira ID / URL 拆分为独立 issue 任务。
2. 执行前识别 issue 间的重复、依赖、重叠、冲突和派生关系。
3. 为每个需要修复的 issue **先定位目标工程根**（workspace 多工程场景，定位逻辑见 `opsx-jira-fix-workflow` 阶段 0 第 4 步），再在对应工程中确认或创建独立 OpenSpec change；若多个 issue 明确属于同一根因且属于同一工程，可复用同一 change，但必须在 `design.md` 中说明覆盖范围。跨工程的 issue 各自建立独立 change，在各自 `design.md` 中互相引用。
4. 对每个 issue 依次调用 `opsx-jira-fix-workflow`，不得绕过阶段 0～7 的 OpenSpec 记录、验证和归档要求。
5. 每个 issue 完成后，基于最新代码状态、PR/MR diff 和 OpenSpec artifacts 重新评估剩余 issue。
6. 单个 issue 失败不阻断后续 issue，但关系为「冲突待确认」的问题必须暂停，等待人工确认口径。
7. 批量结束时输出汇总，并列出每个 issue 的 Jira 状态、OpenSpec change、PR/MR、验证结果和归档状态。

## 批量模式传播

批量场景下，每个 issue 的模式由编排工具根据**用户在批量层面的意图**显式设置，子 skill 的「自动恢复手动」规则不影响批量连续性。

### 传播规则

| 批量触发词 | 编排工具行为 | 子调用模式 |
|-----------|------------|----------|
| 含「自动」（如「opsx 批量自动修复」） | 每个子调用附加 `--auto` | 🤖 自动 |
| 不含「自动」（如「opsx 批量修复」） | 每个子调用不附加 `--auto` | 👤 手动 |

### 设计理由

- **关注点分离**：子 skill（opsx-jira-fix-workflow）不需要感知批量上下文，「完成一轮恢复手动」规则在所有场景下一致
- **显式优于隐式**：编排工具显式传递模式参数，比让子 skill 隐式继承上下文更可靠

每个 issue 的 OpenSpec change 中可在 `design.md` 的备注里记录本次使用的模式。

## Issue 关系识别

需要识别并记录的关系包括：

1. **重复 / 等价问题**：若 B 与 A 的现象、根因、行为契约或修复点相同，且 A 修复后已覆盖 B，则 B 标记为「已跳过（重复覆盖）」。必须在 B 的记录中写明"已由 A / `<change-name>` 覆盖"，无需重复创建修复 PR。
2. **依赖关系**：若 B 的修复必须建立在 A 的代码改动、行为变更或 spec 更新基础上，则 B 标记为「等待依赖」。B 只能在 A 完成验证并明确 archive 策略后继续；执行 B 时必须读取 A 的 `design.md`、`tasks.md`、PR/MR diff 和验证证据。
3. **重叠但不等价**：若 A 与 B 影响同一模块或 capability，但根因、行为契约或验证场景不同，仍需分别分析。编排工具应在各自 `design.md` 的 Risk / Dependencies 中互相引用，并优先串行处理。
4. **冲突关系**：若两个 issue 的期望行为互相矛盾，或一个修复会破坏另一个 issue 的 scenario，暂停相关 issue，标记为「冲突待确认」，要求人工确认产品/技术口径后再继续。
5. **派生问题**：若修复 A 时发现 B 实际是 A 的后续影响、更深层根因或同一 capability 的新增 scenario，应记录派生关系，并决定合并到同一 change、依赖处理，还是拆分为新的 Jira / OpenSpec change。

关系判断至少写入对应 `design.md`：

```text
## Related Issues

- <JIRA-ID>：重复 / 依赖 / 重叠 / 冲突 / 派生；处理结论；关联 PR/MR 或 OpenSpec change。
```

若批量编排工具额外维护进度文档，状态建议包含：待处理 / 处理中 / 已完成 / 已跳过（重复覆盖） / 等待依赖 / 冲突待确认 / 审查未通过（超限） / 失败。
