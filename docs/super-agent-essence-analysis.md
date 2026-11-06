# Super-agent 精华提取与本仓适配分析

> 核验日期：2026-11-06
>
> 材料：
> 1. 对话记录（用户推演的简化系统，10 轮）
> 2. `dsh-superagent` 原型（真实实现，244 文件，含领域模型、授权模型、执行状态机）
>
> 目的：判断哪些思想能被 open-skills 吸收、以什么形态落地、哪些明确不适用。
> 本文是分析提案，不是行为契约；落地需另走 `opsx` 沉淀。

## 摘要

- **最值得吸收的三件事**：`observe` 过渡态、`explicit` / `inferred` 强度、结构化 Report 状态。
- **最重要的一条分歧**：对话记录反复强调 Watchdog，但真实原型**没有 Watchdog**——它用「结构化 Report + 阶段机 + 超时 + 恢复」替代主观监工。
- **最大的定位差异**：原型是运行时系统（事件、常驻、Session、并发），本仓是声明式契约库。能吸收的是**判定结构与状态语义**，不是运行时机制。

## 1. 两份材料的定位

| 材料 | 性质 | 可信度 | 用途 |
|---|---|---|---|
| 对话记录 | 用户与助手推演，代码示例多为伪码 | 中 | 反映用户诉求与直觉 |
| dsh-superagent 原型 | 团队真实使用后开源的研究原型 | 高 | 反映踩过坑之后的设计 |

两者一致处可信度最高；不一致处往往说明原型在真实运行中改过主意。

## 2. 双源对照

### 2.1 一致（可信度最高）

| 主题 | 对话记录 | 原型 |
|---|---|---|
| 两层判定 | 硬规则先过滤，剩下交模型 | Gate（确定性）+ Assessment（模型） |
| 订阅直通 | Worker 订阅后续 Trigger | Subscription fan-out，绕过 Eval 但不授予新权限 |
| 全双工 | 异步派活、可插话 | 后台任务 5 秒转后台、30 分钟上限、人的消息有额外 slot |
| 人工合并门禁 | 合并锁死给人 | auto-merge 默认关，由 Delivery requirements 控制 |
| 人的定位 | 异常兜底 | Attention 状态 + 面板只显示需要人的事项 |

### 2.2 原型独有（真正的增量）

| # | 机制 | 一句话 |
|---|---|---|
| 1 | Mandate | 授权凭证：记录 Policy 版本、scope、strength，回答「凭什么做、能做多远」 |
| 2 | Accept mode `off` / `observe` / `auto` | `observe` 先影子运行、记录会怎么做，观察几轮再自动 |
| 3 | Strength `explicit` / `inferred` | 人明确要求 vs 系统推断，后者默认不放行 |
| 4 | Admission table | 按接收范围配置准入，不是一刀切 |
| 5 | Policy version | 规则变更时进行中的判定作废，live Ticket 收到变更通知 |
| 6 | Report 状态机 | `progress` / `waiting` / `ready` / `blocked` / `failed` / `dropped` |
| 7 | Ticket 阶段由「在等什么」决定 | person/answer、person/review、working、idle |
| 8 | Stop by impact, not by effort | 停止条件按影响而非工作量 |
| 9 | 注意力经济学 | 每条消息、通知、设置都要证明其注意力成本值得 |
| 10 | Subscription 不授予新权限 | 后续消息直达执行器，但每个 Ticket 仍受自身 Mandate 限制 |

### 2.3 对话记录独有（原型未采用）

| 内容 | 原型的做法 | 判断 |
|---|---|---|
| 3 轮重试上限 | Eval 2 次后 `unavailable`；Executor 3 次指数退避；Ticket 独立重试 | 原型更细：**按层分别设上限**，不搞统一数字 |
| 高危模块白名单 | 无硬编码分类，用 Delivery requirements 的自然语言描述 | 原型倾向**用 prompt 表达策略**，不引入配置概念 |
| **Watchdog 独立 Agent** | **不存在** | 见 §5.1，这是最重要的分歧 |

## 3. 可吸收的精华（按价值排序）

### 3.1 `observe` 过渡态（最高价值）

- **原型**：`off` / `observe` / `auto` 三态。`observe` 下推断出的候选会被完整评估，但结论只记成「本会接受」，不真正执行。
- **本仓现状**：`workflow-mode-lifecycle` 只有 manual / auto 两态。
- **差距**：缺少「先影子跑几轮再放行」的中间态。这正是「先不自动 merge，先观察几轮」的需求。
- **建议**：在 `workflow-mode-lifecycle` 增加第三态 `observe`：完整执行判定与记录，但不产生副作用；连续 N 次与人工决策一致后再提示切换 `auto`。

### 3.2 `explicit` / `inferred` 强度（最高价值）

- **原型**：显式请求（人被点名或明确要求）与推断请求（系统认为该做）分开；推断默认只记录。
- **本仓现状**：无此区分。
- **差距**：所有工作流都假设「任务是指定的」，但 `goal-driven-queue` 的批处理、`autoresearch` 类场景里，系统会自己推断。
- **建议**：在任务单增加 `Strength` 字段；`inferred` 任务默认只能进入 `observe`，不得直接执行。

### 3.3 结构化 Report 状态

- **原型**：`progress` / `waiting` / `ready` / `blocked` / `failed` / `dropped`。
- **本仓现状**：结果单只有 `PASS` / `FAIL`，真机验证 pending 只能塞进 `Unresolved`。
- **差距**：`blocked`（等外部条件）、`dropped`（无需处理）、`waiting`（等触发）没有位置。
- **建议**：结果单 `Verdict` 扩展为 `ready` / `blocked` / `failed` / `dropped` / `waiting`，`PASS/FAIL` 作为 `ready` / `failed` 的别名保留兼容。

### 3.4 Gate 与 Assessment 分层

- **原型**：Gate 是确定性规则（谁可以、什么强度），Assessment 才交给模型。
- **本仓现状**：部分门禁（如 `design-approval-gate`）把判定整体交给 AI。
- **建议**：任何门禁先回答「能否用一条命令或一次检查证实」，不能的部分才交模型（与铁律 10 同源）。

### 3.5 Mandate：授权凭证

- **原型**：记录 Policy 版本、scope、strength、匹配的规则、发起人身份。
- **本仓现状**：`ai-proxy-discipline` 的有界授权接近，但无版本与 scope 记录。
- **建议**：在 `deterministic` 类门禁里记录「本次授权依据」，便于事后审计。

### 3.6 Policy version

- **原型**：规则变更使进行中的 Eval 作废，并通知受影响的 live Ticket。
- **本仓现状**：skill 契约无版本概念；OpenSpec 有，但只覆盖 spec 层。
- **建议**：skill 的 `version` 字段已有，可增加「契约版本变更影响面」检查（哪些运行中的流程需要重新判定）。

### 3.7 按影响停止

- **原型**：本地改动可推进到可评审结果；需要设计决策的改动带着明确问题停下。
- **本仓现状**：按难度分级（🔴 / 🟠），但未显式以「影响」为停止判据。
- **建议**：保留难度分级，补一句「停止点由影响决定，不由工作量决定」。

### 3.8 注意力经济学

- **原型**：每条消息、通知、面板元素、文档段落都要证明其注意力成本值得。
- **本仓现状**：`report-output-discipline` 管格式，不管「值不值得发」。
- **建议**：在报告纪律中加入一条判断标准：这条内容是否改变读者的行动？不改变则不写。

### 3.9 面板只显示需要人的

- **原型**：面板首屏只列等待人的事项，健康状态不占空间。
- **本仓现状**：`goal-driven-queue` 的验收包是正向清单。
- **建议**：验收视图默认折叠「已完成」，只展开「需要你决定」的项。

### 3.10 Subscription 不授予新权限

- **原型**：后续消息直达执行器，但每个 Ticket 仍受自身 Mandate 限制；上下文订阅不授予权限。
- **本仓现状**：无对应概念。
- **建议**：若未来做「后续消息续跑同一任务」，必须写明「续跑沿用原授权，不自动扩大 scope」。

## 4. 与本仓现有能力的映射

| 原型机制 | 本仓对应 | 关系 |
|---|---|---|
| Gate | `design-approval-gate`、`merge-discipline` Part R | 部分对应，可补强 |
| Assessment | 各 workflow 的阶段判定 | 已覆盖 |
| Mandate | `ai-proxy-discipline` 有界授权 | 概念接近，缺版本/scope |
| Accept mode | `workflow-mode-lifecycle` | **缺 observe** |
| Strength | 无 | **缺** |
| Report 状态 | 角色结果单 | **缺 blocked/dropped/waiting** |
| Admission table | `goal-driven-queue` 的 triage | 语义不同（队列等价合并 ≠ 准入） |
| Policy version | skill `version` + OpenSpec | 部分覆盖 |
| 注意力经济学 | `report-output-discipline` | 只管格式 |
| Subscription | 无 | 不适用（无运行时） |
| Source / Channel / 面板 | 无 | 不适用 |

## 5. 冲突与边界分析

### 5.1 Watchdog 与状态机：原型选择了后者

对话记录把 Watchdog 当作核心，但原型里没有。它用四件事替代：

1. **结构化 Report**：执行器必须报告状态，而不是让外部猜
2. **阶段机**：Ticket 的当前阶段由「在等什么」确定，异常自然显形
3. **超时**：后台任务 30 分钟上限、Eval 超时重排
4. **恢复**：重启后按存储的 Report 与 Input 重建，不依赖内存状态

**对本仓的含义**：与其新增一个「Watchdog 角色」去监控其他角色，不如把**结果单状态做全**，让异常从状态里读出来。这也是为什么第 3.3 条排在前面。

### 5.2 `observe` 与现有 auto/manual 的关系

`observe` 不是第三种「谁来决定」，而是**同一套判定在无副作用模式下运行**。它与 `ai-proxy` 的区别：

- `ai-proxy`：AI 代理**坐在人的位置**做决策
- `observe`：AI 照常做决策，但**不执行**，只记录

两者可叠加：`observe` + `ai-proxy` = 代理决策并要求记录，供人回看。

### 5.3 注意力经济学与报告纪律

现有 `report-output-discipline` 回答「写到哪里、什么格式」；原型的原则回答「**该不该写**」。两者不冲突，应叠加。

### 5.4 Policy version 与 OpenSpec

OpenSpec 已覆盖 spec 的版本化，但 skill 的 prompt 契约（如 `_contract.md`）没有版本。若引入 Mandate，需要同时定义「契约版本变更时，运行中的流程如何处理」。

## 6. 落地建议（三期）

| 期 | 内容 | 依赖 | 风险 |
|---|---|---|---|
| 一期 | `observe` 过渡态 + `explicit`/`inferred` 强度 | 无运行时依赖 | 与现有 mode 自动回退规则交互，需明确优先级 |
| 二期 | Report 状态扩展（`blocked` / `dropped` / `waiting`） | 需同步所有宿主的结果单解析 | 兼容性：`PASS/FAIL` 需保留别名 |
| 三期 | Mandate + Policy version + 注意力经济学条款 | 需先有一期的 strength 概念 | 容易变成过度设计，建议只在有审计需求时引入 |

**共同前提**：每一期都要先写 OpenSpec delta，再改 skill；不能只改 prompt。

## 7. 明确不适用

以下机制依赖运行时，本仓不实现：

| 机制 | 原因 |
|---|---|
| Source 接入（GitHub / IM 轮询、读位置） | 无常驻进程 |
| 常驻 Session 与目录隔离 | 宿主职责 |
| 并发 slot 与超额 slot | 宿主调度 |
| 后台任务 30 分钟上限 | 宿主执行模型 |
| Channel 重试与顺序保证 | 无消息队列 |
| 面板 | 无 UI 宿主 |

这些若要做，应落在宿主适配层，而不是 skill 里。

## 8. 结论

1. **本仓最该吸收的不是「多个 agent」，而是「状态做得更全、判定分得更细」**。
2. **Watchdog 可以不建**——把 Report 状态与阶段机做对，异常会自己显形。
3. **`observe` 与 `explicit`/`inferred` 是投入产出比最高的两项**，且不依赖运行时。
4. 其余机制（Mandate、Policy version）在有审计需求时再引入，避免过早复杂化。
