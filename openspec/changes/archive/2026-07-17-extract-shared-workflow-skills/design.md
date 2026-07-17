# Design: extract-shared-workflow-skills

## Context

`solve-workflow`（655 行）是本仓库最早的工作流 skill，后续 `jira-fix-workflow`（1024 行）、`opsx-solve-workflow`（655 行）、`opsx-jira-fix-workflow`（651 行）以其为模板拷贝演进。经逐行核实，4 段通用机制存在 3–4 份重复拷贝且已漂移：

| 机制 | solve-workflow | opsx-solve-workflow | jira-fix-workflow | opsx-jira-fix-workflow | perf-workflow |
|------|---------------|--------------------|--------------------|------------------------|---------------|
| 模式生命周期 | 65–100 完整 | 65–87（无批量场景，+OpenSpec 说明） | 61–89（+特有差异表） | 64–86（+opsx/jira 混合说明） | 无模式概念 |
| 提问纪律 | 120–145 完整 | 内联一段（格式委托 solve） | 127–141 紧凑版 | 单行 blockquote | 无 |
| 环境能力探索 | 148–193 完整 | 177–209 删减版（缺时机/方法） | 143–188 完整+state.json | **整段缺失** | 无 |
| 调研路由+快搜+通病 | 252–297 完整 | 297–341 近乎逐字 | 369–434 语义变体（门控通病+Jira 评论） | **整段缺失** | 仅快搜类似物 |

既有约束：spec `clarifying-question-discipline` 已存在（覆盖提问纪律行为契约）；`effective-web-research` 已承载调研纪律（Step 0 + 4 口诀 + 严格模式）；`upstream-dependency-debug` 已承载上游依赖评估（本次不动）；跨 skill 委托有先例（opsx-solve-workflow 的提问格式委托 solve-workflow）。

## Goals / Non-Goals

**Goals**

- 4 个共享 skill 单点承载通用机制；5 个存量工作流改为引用 + 仅保留特有差异
- solve-workflow 655 → 约 490 行（-25%）；jira-fix-workflow 同步压缩约 100 行
- `opsx-jira-fix-workflow` 接入环境能力探索与调研路由（行为增强，显式标注）
- `perf-workflow` 通用原则补一行提问纪律引用
- 附带清理：solve-workflow 删 PDCA 对应表、瘦身常见错误表、快速参考表标注以阶段正文为准

**Non-Goals**

- 不改动任何工作流的触发词、description（触发语义不变）、阶段门禁、输出格式契约
- 不统一 jira-fix-workflow 的语义变体（门控通病、Jira 评论动作保留在其正文）
- 不改动 `think-big`（其内联英文纪律保留为 spec 允许的内联形态）
- 不改动 `upstream-dependency-debug`、`effective-web-research`、`runtime-evidence-debug` 等已有被委托 skill
- 不抽取阶段 3 审查循环、前置 skill 检查机制（编排特有/已够简）

## Decisions

### D1：4 个独立 skill，而非合并为 1–2 个

四个机制语义独立（模式机 / 交互纪律 / 环境扫描 / 调研路由），合并会迫使引用方加载无关内容，且依赖语义不同（见 D2）。替代方案（合并为 workflow-core-discipline + research-routing）在阶段 2 方案 C 中已评估否决。

### D2：依赖语义分级——核心纪律强依赖，环境探索弱引用

- `workflow-mode-lifecycle`、`clarifying-question-discipline`、`known-issue-research`：进引用方 frontmatter `dependencies`，前置检查缺失即中止。理由：它们是阶段门禁的根基，弱引用会导致无 skill 环境下门禁语义漂移，违反「不降级原则」。
- `env-capability-discovery`：**不进** dependencies，弱引用。理由：其语义本身就是「未匹配到→静默跳过」，且「声明 dependencies 必须前置检查+缺失中止」的仓库规则与其可选增强定位冲突；spec 已固化「不声明、静默降级」。
- `known-issue-research` 自身 dependencies 声明 `effective-web-research`。

### D3：`clarifying-question-discipline` 命名对齐既有 spec

替代名 `single-question-discipline` 会新造概念、与既有 spec 名分叉。既有 spec 的合规形态改为二选一（引用形态 / 内联形态），使 think-big 无需改动即持续合规。

### D4：共享 skill 只承载稳定核心，特有差异留在各工作流

- `workflow-mode-lifecycle` 只含：自动恢复手动、显式重进、批量场景。jira 的 `--retry`/`--resume`/回退规则、opsx 的归档说明留在各自「特有差异」块。
- `env-capability-discovery` 不含任何具体阶段编号；各工作流自持「能力→阶段」映射小表（约 10 行）与结果存储位置（会话上下文 / state.json）。
- `known-issue-research` 不含 jira 的门控通病与 Jira 评论动作。

### D5：known-issue-research 步骤编号参数化

共享 skill 正文中所有步骤编号与跳转目标用占位符书写：`{影响范围评估步骤}`、`{根因分析步骤}`；引用方在引用行注明自身编号映射（如 solve-workflow：跳步骤 4；opsx-solve-workflow：跳步骤 5）。替代方案（共享 skill 硬编码 solve 编号）会导致其他引用方跳转错误，否决。

### D6：报告模板归属

「行业通病评估报告」模板从 solve-workflow/reference.md 迁入 `known-issue-research/reference.md`；jira 变体模板留在 jira-fix-workflow/reference.md。solve-workflow/reference.md 的「前置 skill 检查 — 缺失提示」按新依赖清单（9 个）更新。

### D7：新 skill 均为 `user-invocable: false`，正文英文

铁律 3 要求正文英文；四个 skill 均被工作流引用，满足「user-invocable: false 但无引用」反模式的豁免。description 用单行双引号（gen-skill-docs.mjs 简易解析器约束）。创建走 `/skill-creator` 流程（铁律 4）。

## Risks / Trade-offs

- 抽取时误删特有差异（jira 门控通病、`--retry`/`--resume`、state.json 存储）→ 差异清单已逐行在案（见 Context 表）；spec 契约显式保留；阶段 6 逐文件 diff 验证
- solve-workflow dependencies 6→9，前置检查变重 → 本仓库标准安装为全量（`npx skills add -g`），新 skill 随包发布；缺失提示模板同步更新
- 步骤编号参数化增加引用方理解成本 → 引用行内联注明编号映射，每处 1 行
- opsx-jira-fix-workflow 行为增强拉长其流程 → 已与用户确认（范围 A）；其调研路由默认 🟢 内部为主，多数场景零额外动作
- 一行引用替代醒目声明可能弱化提问纪律显著性 → spec 要求保留三触点（入口约束 + Red Flags + 醒目指针声明）

## Migration Plan

1. 走 `/skill-creator` 依次创建 4 个共享 skill（顺序：clarifying-question-discipline → workflow-mode-lifecycle → env-capability-discovery → known-issue-research，小→大验证抽取模式）
2. 重构 solve-workflow（SKILL.md + reference.md）→ 行数验证
3. 重构 opsx-solve-workflow（同源双胞胎，验证参数化适配）
4. 重构 jira-fix-workflow、opsx-jira-fix-workflow、perf-workflow
5. 更新 AGENTS.md Skill 清单；`node scripts/gen-skill-docs.mjs` 重生成索引
6. 阶段 6 验证后提交

回滚：全部 git 文本变更，`git revert` 单 commit 即可回滚；新 skill 删除目录即消失。

## Open Questions

- 无阻断性开放问题。次要项：4 个新 skill 的版本号从 `1.0.0` 起（随仓库 CI 自动递增规则演进）。
