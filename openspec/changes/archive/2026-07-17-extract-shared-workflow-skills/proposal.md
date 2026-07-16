# Proposal: extract-shared-workflow-skills

## Why

`solve-workflow`（655 行）中约 140 行是通用机制（模式生命周期、环境能力探索、提问纪律、调研路由），且在 `jira-fix-workflow`、`opsx-solve-workflow`、`opsx-jira-fix-workflow` 中存在近乎逐字的重复拷贝，已逐行实证。根因：solve-workflow 是最早的工作流 skill，后续工作流以其为模板拷贝演进，导致通用机制多点维护、各自漂移（粒度不一、表格行数不一、opsx-jira-fix-workflow 整段缺失环境探索与调研路由）。将这些机制抽取为独立共享 skill、各工作流改为引用整合，既压缩 solve-workflow 行数（655 → 约 490 行，-25%），又把重复收敛到单点维护。

## What Changes

- 新建共享 skill `workflow-mode-lifecycle`：承载自动/手动模式核心生命周期（自动恢复手动、显式重进、批量场景）；各工作流保留各自的「特有差异」块（jira 的 --retry/--resume/回退规则、opsx 的归档说明）
- 新建共享 skill `env-capability-discovery`：承载环境能力扫描方法（`<available_items>`/skill 工具/Cursor/通用降级）、通用能力类型关键词表、调用原则 5 条；各工作流只保留自己的「能力→阶段映射」小表与结果存储位置（会话上下文 / state.json）；弱引用，保持「静默跳过」语义
- 新建共享 skill `known-issue-research`：承载调研路由三态（🟢内部/🔵外部/🟣hybrid）、已知问题快搜（触发条件 + 结果处理）、行业通病评估（触发 + 结果处理），统一委托 `effective-web-research` 的调研纪律；步骤编号参数化以适配各工作流；强依赖 `effective-web-research`
- 新建共享 skill `clarifying-question-discipline`：承载一次一问硬纪律完整形态（提问格式、简答约定、为什么、禁止条款）；命名对齐既有 spec `clarifying-question-discipline`（替代原拟名 single-question-discipline）
- 重构 5 个存量 skill 引用上述共享 skill 并删除重复段落：`solve-workflow`、`opsx-solve-workflow`、`jira-fix-workflow`、`opsx-jira-fix-workflow`（全量接入）、`perf-workflow`（仅通用原则补一行提问纪律引用）
- `opsx-jira-fix-workflow` 接入 `env-capability-discovery` 与 `known-issue-research` 属**行为增强**（该 skill 原本整段缺失），在变更中显式标注
- `jira-fix-workflow` 的语义变体保留为特有差异：行业通病评估为门控（非可选）、🚫 结论追加「写 Jira 评论」动作、报告模板留在其 reference.md
- solve-workflow 附带清理：删除 PDCA 对应表（AGENTS.md 反模式）、瘦身常见错误表（去除与各阶段 Red Flags 重复的条目）、快速参考表标注以阶段正文为准
- solve-workflow/reference.md：「行业通病评估报告」模板迁入 known-issue-research；「前置 skill 检查 — 缺失提示」按新依赖清单更新
- AGENTS.md Skill 清单表与依赖关系列同步更新；`docs/generated/skills-index.md` 由 pre-commit hook 自动重生成
- 各工作流的触发词、description、阶段门禁、输出格式契约**不改动**

## Capabilities

### New Capabilities

- `workflow-mode-lifecycle`: 自动/手动模式生命周期的共享契约——核心规则（自动恢复手动、显式重进、批量场景）单点定义，引用方工作流以其为准并仅追加各自特有差异
- `env-capability-discovery`: 环境能力探索的共享契约——扫描方法、能力类型关键词、渐进增强调用原则单点定义，引用方工作流仅保留各自阶段映射；弱引用、静默降级
- `known-issue-research`: 代码问题外部调研的共享契约——调研路由判断、已知问题快搜、行业通病评估单点定义，统一委托 `effective-web-research`，步骤编号参数化

### Modified Capabilities

- `clarifying-question-discipline`: 纪律完整形态从内联于各工作流改为沉淀为同名共享 skill；工作流合规形态相应调整为「引用共享 skill + 保留入口数量约束 + Red Flags 违规条 + 醒目声明指针」

## Impact

- **新建**：`skills/workflow-mode-lifecycle/`、`skills/env-capability-discovery/`、`skills/known-issue-research/`、`skills/clarifying-question-discipline/`（各含 SKILL.md，known-issue-research 含 reference.md 承载报告模板）
- **修改**：`skills/solve-workflow/`（SKILL.md + reference.md）、`skills/opsx-solve-workflow/`、`skills/jira-fix-workflow/`（SKILL.md + reference.md）、`skills/opsx-jira-fix-workflow/`、`skills/perf-workflow/`、`AGENTS.md`、`docs/generated/skills-index.md`（自动生成）
- **依赖变化**：solve-workflow dependencies 6 → 9（+workflow-mode-lifecycle、+clarifying-question-discipline、+known-issue-research）；env-capability-discovery 为弱引用不进 dependencies；known-issue-research 自身依赖 effective-web-research
- **行为变化**：opsx-jira-fix-workflow 新增环境能力探索与调研路由/已知快搜/行业通病评估环节（行为增强）；其余工作流行为不变，仅重复段落改为引用
- **验证**：`node scripts/gen-skill-docs.mjs` + `git diff --exit-code docs/generated/skills-index.md`；新 skill 经 skill-creator 流程创建（含触发词/描述质量检查）；`grep -r "^---$" skills/*/SKILL.md` frontmatter 检查；description 单行双引号（本仓库 gen-skill-docs.mjs 约束）
