## Context

三个同源工作流（opsx-jira-fix-workflow / opsx-solve-workflow / jira-fix-workflow）的合并纪律规则分散在 reference.md（覆盖率门控规范 ~60 行/处逐字同步 = ~180 行）+ SKILL.md 合并章节。本次 tip 钉死复盘（PR #230 已关闭）暴露：若 tip 钉死再内联三处会加剧膨胀。三个 SKILL.md 已超 skill-creator 的 <500 行理想线（688/640/986）。

本仓库已有成熟的横切 skill 模式：12 个 skill 被 frontmatter dependencies 引用 ≥4 次（solution-review / code-design-review / workflow-mode-lifecycle / clarifying-question-discipline 等）。合并纪律契合此模式——它是合并阶段的横切关注点。

## Goals / Non-Goals

**Goals:**
- 新建 `merge-discipline` skill 作为合并纪律单一事实源（覆盖率门控 + tip 钉死合一）
- 消除 ~270 行三处重复（180 门控 + 90 tip）
- 三个工作流 SKILL.md 各减约 25 行，回归 progressive disclosure 的轻量层
- reference.md 保留合并前快查表（progressive disclosure 轻量层），skill 承载全量规范

**Non-Goals:**
- 不改 openspec-archive-change（OPSX 原生 skill，openspec update 会覆盖）
- 不改 finishing-a-development-branch（superpowers 插件，不在本工程）
- 不重构阶段 2/4 的横切 skill 复述（C 方案，留作后续独立 change）
- 不改变合并纪律的规则语义（仅迁移承载位置 + 合并门控与 tip 钉死为一体）

## Decisions

### D1: 抽取独立 skill（而非 reference 下沉 / 跨 skill 共享文件）

**选择**：独立 `merge-discipline` skill，三个工作流 frontmatter dependencies 强依赖。

**理由**：
- reference 下沉（方案 1）：仍是三处 reference 同步，重复度不变
- 跨 skill 共享文件 `skills/_shared/`（方案 3）：本仓库无此结构先例，引入新模式
- 独立 skill：符合本仓库 12 个横切 skill 的既有模式，单一事实源，改一处三处生效

**备选**：保持现状（reference 三处同步）——但本次 tip 钉死会加剧到 ~270 行重复，且未来合并纪律演进需改三处。

### D2: 强依赖（frontmatter dependencies + 前置检查）

**选择**：merge-discipline 作为三个工作流的强依赖（进 frontmatter dependencies + 前置 skill 检查核对）。

**理由**：合并纪律是防真实事故的硬规则（本事件致 archive 未随 MR 合入目标分支）。强依赖保证不缺失（与 solution-review / code-design-review 等横切 skill 同模式）。弱依赖（环境探索）会让规则可能丢失，不可接受。

### D3: reference 留快查表，skill 留全量（progressive disclosure 两层）

**选择**：三处 reference.md 保留合并前快查表（~15 行紧凑列表：门控 5 项 + tip 钉死 3 项，每项指向 skill step），skill 承载完整规范（门控步骤 + tip 4 步 + 命令模板 + 判定矩阵 + 双策略）。

**理由**：快查表是合并前自检的快速参考（AI 不必切换到 skill 即可过一遍清单）；全量规范是执行细节（合并时才加载）。符合 skill-creator progressive disclosure：reference 是轻量层，skill 是全量层。

**备选**：reference 只留一句指针（最轻盈）——但 AI 合并时要切换到 skill 看清单，多一次加载。快查表平衡了轻盈与实用。

### D4: user-invocable: true（独立触发 + 被依赖）

**选择**：merge-discipline 设 `user-invocable: true`，description 含中文触发词。

**理由**：合并可能发生在工作流外（用户直接说「帮我 merge 这个 MR」）。姊妹事件 merge-coverage-gate-bypass 的教训之一是「合并动作本身要触发纪律，不能只依赖工作流上下文」。user-invocable: true 让直接合并场景也能触发。模式对标 solution-review（被依赖且独立触发）。

### D5: SKILL.md 合并章节保留顺序约束 + 指针 + 关键 Red Flag

**选择**：三处 SKILL.md 合并章节不删除，保留：①顺序约束行（含 tip 钉死环节）②一句指针（指向 merge-discipline skill）③1-2 条关键 Red Flag。

**理由**：顺序约束行是工作流自身的阶段编排（各工作流略有差异），不属于横切 skill。Red Flag 是 SKILL.md 的合规内容（紧凑）。完整规则委托 skill。

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| merge-discipline skill 缺失时三工作流前置检查中止（强依赖） | 前置检查提示安装命令；merge-discipline 是本仓库 skill，随仓库分发 |
| reference 快查表与 skill 全量规范不同步（改 skill 忘改 reference） | 快查表是指针式（每项指向 skill step N），不复制规则文本，同步成本低 |
| glab mr merge --sha 在某些 glab 版本不支持 | skill 已含 fallback：不支持时等 pipeline 通过 + 合入后祖先校验兜底 |
| 三工作流 dependencies 数量 +1 增加前置检查维护 | 与现有 12 个横切 skill 同模式，维护负担同质 |

## Open Questions

无（5 个决策点已通过 3 轮提问全部厘清）。
