# Design: assess-stage-skill-extraction

## Context

用户提议将 4 个工作流的相似阶段抽取为独立共享 skill（减行、更专业）。经三路测绘（solve 系/jira 系/扩围系）：solve↔opsx 真重复 ~150-160 行、jira 系 ~75-80 行逐字+~50 语义、batch 系零重复、perf 仅 1 处可抽。既有共享 skill 处于「方法论/编排」自然边界。本 change 仅产出分析报告（用户明确不实施）。

## Goals / Non-Goals

**Goals:**
- 分析报告文档（重复度矩阵、抽取设计、成本收益、结论=A 定向双抽取）
- 双抽取设计细化：① 分析阶段核心共享 skill（候选名 `analysis-core` 或按 skill-creator 定）的内容清单、占位符设计（`{next-stage}` 出口目标、步骤号沿用 known-issue-research 机制）、4 个工作流的差异留存量 ② 覆盖率门控规范单源化落点（首选 `test-coverage-analyzer` skill 本体）
- 3 个小修复的独立说明（jira-fix 委托化、perf 快搜并入、opsx 常见错误去重）

**Non-Goals:**
- 不修改任何工作流 skill 或新建 skill（实施属未来独立 change）
- 不触碰 4 处有意分歧（覆盖率门控强度、ensure-tests 强度、行业通病处理、追踪注释强度）
- 不处理 batch 系（零重复）与 perf-workflow 的「神似」部分（域化重写无可提文本）

## Decisions

1. **报告背书方案 A**：定向双抽取 > 全阶段抽取（阶段正文 80% 为编排不可抽）> 仅小修（真重复继续积累）> 不动。
2. **分析核心 skill 边界**：仅下沉方法论性内容——临时改动权限与回滚门控、打点调试触发条件与 3-skill 委托、调试-验证闭环、分析步骤骨架（存在性验证→调研路由→现象/定位/根因/上游/影响）；编排性内容（出口停点、手动/自动差异、OPSX/Jira 产物落点、行业通病门控、难度分级）一律留工作流。
3. **占位符设计**：出口目标用 `{next-stage}` 占位符（各工作流引用行声明「号+名」映射，沿用 known-issue-research:76 的契约要求）；步骤号映射继续留在各工作流。
4. **覆盖率门控单源落点**：首选 `test-coverage-analyzer` skill 本体承载规范 v1，3 处 reference.md 改一句引用；实施时先验证其 PromptScript 类型/全局安装限制对引用方的影响。
5. **3 个小修复与抽取同批独立 commits**（jira-fix 委托化 solution-review、perf 快搜并入 known-issue-research ~15 行、opsx-solve 常见错误表按精简原则去重 45 行中复述段）。

## Risks / Trade-offs

- 报告被误读为「直接动手」的授权 → 报告首页明确「分析结论，实施需独立 opsx change + skill-creator」
- 占位符漏映射导致阶段跳转错位 → 报告附各工作流映射表草案（solve/opsx=阶段 3、jira=阶段 5、opsx-jira=阶段 3）
- 单源化后两处 reference.md 变薄引发读者找不到规范 → 引用句含明确路径（沿用既有「见 x/reference.md」惯例）

## Migration Plan

无需迁移（本 change 不改行为）。未来实施时按报告中的映射表逐工作流下沉 + 引用替换，沿用重编号变更的双语残留 grep 门控。
