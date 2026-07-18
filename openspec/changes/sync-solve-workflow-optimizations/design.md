# Design: sync-solve-workflow-optimizations

## Context

PR #218（solve-workflow 本体 7 类优化，未合并）需在 solve 家族内推广。1.2 全量扫描已产出「优化类型 × skill」映射：4 个镜像/委托方 skill（opsx-solve-workflow、jira-fix-workflow、opsx-jira-fix-workflow、runtime-evidence-debug）存在同款缺陷，solve-workflow 自身另有 1 处补漏（node-version-discipline 调用未声明）。另发现既有 spec `env-capability-discovery` 与 PR #218 已落地行为矛盾（spec 漂移）。约束：PR #218 未合并，main 上 solve-workflow 仍为旧版文本。

## Goals / Non-Goals

**Goals:**（批 1，低风险契约文本同步）
- C：browser-debug-toolkit 口径 4+2 处扩大为「浏览器可复现」（复现+验证闭环）
- B：3 个工作流打点权限句统一为「AI 直接添加+登记+出口前回滚」
- E：3 个工作流 env-capability-discovery 转强依赖（禁令句同步改写）
- F：3 个工作流 ensure-tests 转强依赖 + 测试基建二分支（jira 错误表述修正、opsx 自动搭建语义加门控）
- G：opsx-solve-workflow 阶段 7 小节更名「复盘改进（委托 learn-and-improve）」
- D 局部：opsx「步骤 5.5」悬空引用、jira 难度分级编号矛盾（3.5 vs 2.5）
- solve-workflow 补 node-version-discipline 为第 12 个强依赖（挂 PR #218 分支）
- env-capability-discovery spec 弱引用 Requirement 补齐为「默认弱引用+显式强依赖例外」

**Non-Goals:**
- 批 2：opsx-solve-workflow 八阶段拆分、各工作流小数/0 起始序号统一、openspec 原生 skill 阶段映射表编号
- `AGENTS.md:79` env-cap 行的多声明方更新（留 #218 合并后处理，避免跨 PR 同行冲突）
- jira-fix-batch / opsx-jira-fix-batch（扫描零命中）、git-release-* 域内编号

## Decisions

1. **分支策略：双轨**。solve-workflow 补漏挂 `feat/solve-workflow-split-analysis-stage`（#218，同文件同主题，沿用既定追加模式）；其余批 1 从 **main 新建 `feat/sync-workflow-contracts`**，与 #218 解耦（扫描确认批 1 目标文件均未被 #218 触碰，main 文本即可作为基线）。备选「等 #218 合并再动手」会阻塞全部工作，不取。
2. **jira 存储约定保留**：jira-fix-workflow 弱引用句改写时保留「结果记入 state.json `enhanced_capabilities` 字段」——env-cap spec Requirement 3 的引用方保留项。
3. **opsx 测试 section 加门控**：opsx 两个工作流「框架缺失→自动安装配置」与二分支冲突，统一改为「安装前先按一次一问纪律询问用户」。
4. **env-cap spec 用 MODIFIED 且保留原标题**：归档时按标题匹配（whitespace-insensitive），标题改名将导致匹配失败；正文改为「默认弱引用+例外」。
5. **批 1 不动任何编号**：opsx 原生 skill 阶段映射表（1.1/1.2 ↔ new/continue-change）在批 2 拆分时统一处理，避免批间半同步。
6. **`node-version-discipline:240` Soft-referencers 行同步**：solve-workflow 转强后从 soft 列表移除（ensure-tests 保留）。

## Risks / Trade-offs

- 硬门槛扩大（3 工作流 × 2 新强依赖）→ 用户已确认先例；各 reference.md 缺失提示同步承载安装指引
- 跨 PR 同行冲突（AGENTS.md :79）→ 该行留给 #218 合并后处理（Non-Goals）
- 批 1 完成后 opsx-solve-workflow 仍是 7 阶段文本但 browser 口径等新表述已落地 → 属刻意半同步，批 2 收口；PR 描述中显式说明批次划分
- jira-fix-workflow frontmatter 依赖实况未读 → 执行时先读其 frontmatter 再编辑（不凭扫描假设）

## Migration Plan

无需迁移。纯文本契约同步，PR 评审合并后旧表述自然失效；「回顾总结」在各处保留别名/兼容表述。
