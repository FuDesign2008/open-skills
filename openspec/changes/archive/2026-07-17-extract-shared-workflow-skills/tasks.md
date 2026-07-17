# Tasks: extract-shared-workflow-skills

## 1. 前置：开分支

- [x] 1.1 创建 feature 分支 `feat/extract-shared-workflow-skills`（AGENTS.md：执行计划前先开分支，禁止直接在 main 上修改）

## 2. 创建共享 skill：clarifying-question-discipline

- [x] 2.1 唤起 `/skill-creator`，按其流程创建 `skills/clarifying-question-discipline/SKILL.md`：`user-invocable: false`，英文正文，承载一次一问硬纪律完整形态（纪律声明+为什么、单问题+多选项格式、简答约定、平台无关提问方式、调查优先原则）；description 单行双引号
- [x] 2.2 验证 frontmatter 解析正常（`grep "^---$" skills/clarifying-question-discipline/SKILL.md` 计 2 行）

## 3. 创建共享 skill：workflow-mode-lifecycle

- [x] 3.1 经 skill-creator 流程创建 `skills/workflow-mode-lifecycle/SKILL.md`：`user-invocable: false`，英文正文，承载核心规则（自动恢复手动场景表、显式重进、隐式延续不激活、批量场景）；不含任何工作流特有差异（jira --retry/--resume、opsx 归档说明均不出现）
- [x] 3.2 验证 frontmatter 解析正常

## 4. 创建共享 skill：env-capability-discovery

- [x] 4.1 经 skill-creator 流程创建 `skills/env-capability-discovery/SKILL.md`：`user-invocable: false`，英文正文，承载探索方法（available_items/skill 工具/通用降级）、通用能力类型关键词表（不含任何具体阶段编号）、调用原则 5 条（渐进增强/只读阶段不获写权限/失败不阻断/先读最新说明/dependencies 不走探索）
- [x] 4.2 验证 frontmatter 解析正常

## 5. 创建共享 skill：known-issue-research

- [x] 5.1 经 skill-creator 流程创建 `skills/known-issue-research/SKILL.md`：`user-invocable: false`，英文正文，frontmatter `dependencies: [effective-web-research]` 并实现前置检查（缺失即中止+安装提示）；承载调研路由三态（🟢/🔵/🟣，默认内部为主）、已知问题快搜（3 触发条件+4 行结果处理表）、行业通病评估（触发条件+3 行结果处理表）；步骤编号用占位符（如 `{影响范围评估步骤}`）参数化，不硬编码任何工作流编号；含一行 WebSearch 纪律委托 effective-web-research
- [x] 5.2 创建 `skills/known-issue-research/reference.md`：迁入「行业通病评估报告」模板（自 solve-workflow/reference.md）与「上游依赖修复评估」输出模板
- [x] 5.3 验证 frontmatter 解析正常

## 6. 重构 solve-workflow

- [x] 6.1 frontmatter `dependencies` 增加 `workflow-mode-lifecycle`、`clarifying-question-discipline`、`known-issue-research`（6→9）；前置检查清单同步；reference.md 缺失提示模板同步更新
- [x] 6.2 删除「与戴明环（PDCA）的对应」小节（AGENTS.md 反模式）
- [x] 6.3 「模式生命周期」小节（行 65–100）替换为引用声明（约 5 行：模式识别规则保留 + 引用 workflow-mode-lifecycle）
- [x] 6.4 「通用原则」（行 120–145）替换为醒目指针声明（保留 ⚠️ 硬纪律标签的一行引用 + 阶段 1.1 入口数量约束不动）
- [x] 6.5 「环境能力探索」（行 148–193）替换为弱引用说明 + solve 自身的「能力→阶段映射」小表（阶段编号 1/2/3/4/5/6）
- [x] 6.6 阶段 1.2 的 0.5 调研路由、2.5 已知问题快搜、3.5 行业通病评估（行 252–297）替换为引用 known-issue-research + 编号映射行（跳步骤 4）；3.6 上游依赖评估保持委托 upstream-dependency-debug 不动
- [x] 6.7 瘦身「常见错误」表：删除与各阶段 Red Flags 重复的条目，仅保留跨阶段非直觉陷阱
- [x] 6.8 快速参考表保留骨架，标注「以各阶段正文为准」；reference.md 移除「行业通病评估报告」模板（已迁入 known-issue-research）
- [x] 6.9 行数验证：`wc -l skills/solve-workflow/SKILL.md` 目标 ≤ 510 行；Red Flags 中提问纪律违规条保留（spec 触点）

## 7. 重构 opsx-solve-workflow

- [x] 7.1 dependencies 增加 3 个强依赖 skill；前置检查同步
- [x] 7.2 模式生命周期（行 65–87）替换为引用 + 保留「OpenSpec 特有说明」块（归档完成恢复手动/archive 失败视为中断）
- [x] 7.3 阶段 1.1 内联提问纪律段落替换为醒目指针声明（保留「无论是否检测到 brainstorming 都必须遵守」注）
- [x] 7.4 阶段 0 环境能力探索段落（行 177–209）替换为弱引用 + 自身映射小表
- [x] 7.5 调研路由/快搜/通病（行 297–341）替换为引用 + 编号映射行（跳步骤 5）

## 8. 重构 jira-fix-workflow

- [x] 8.1 dependencies 增加 3 个强依赖 skill；前置检查同步
- [x] 8.2 模式生命周期（行 61–89）替换为引用 + 保留「特有差异」表（--retry 重置手动/--resume 沿用断点/验证回退≤2 次/极难终止等 6 行）
- [x] 8.3 通用原则提问纪律（行 127–141）替换为醒目指针声明；「Jira 状态边界」bullet 保留
- [x] 8.4 环境能力探索（行 143–188）替换为弱引用 + 自身映射小表（含 🌿 分支管理→阶段1 行）+ state.json `enhanced_capabilities` 存储说明
- [x] 8.5 阶段 2 调研路由/快搜/通病（行 369–434）替换为引用 + jira 特有差异（通病评估为门控、🚫 结论停止流程并写 Jira 评论、报告模板留在其 reference.md）
- [x] 8.6 行数验证：`wc -l skills/jira-fix-workflow/SKILL.md` 记录压缩量（预期约 -100 行）

## 9. 重构 opsx-jira-fix-workflow + perf-workflow

- [x] 9.1 opsx-jira-fix-workflow：dependencies 增加 3 个强依赖；模式生命周期替换为引用 + 保留特有说明（--retry/--resume/归档）；单行提问纪律 blockquote 替换为醒目指针声明
- [x] 9.2 opsx-jira-fix-workflow：新增环境能力探索弱引用段落 + 自身映射小表（原整段缺失，行为增强）；阶段 2 新增调研路由/快搜/通病引用（原整段缺失，行为增强，编号映射到其步骤）
- [x] 9.3 perf-workflow：通用原则补一行提问纪律醒目指针声明（其余不动）

## 10. 文档与索引同步

- [x] 10.1 AGENTS.md Skill 清单表新增 4 行（类别：工作流基础设施/纪律），solve-workflow 依赖列同步更新
- [x] 10.2 运行 `node scripts/gen-skill-docs.mjs`，确认 `docs/generated/skills-index.md` 重生成且无解析异常（4 个新 skill 描述列不为 `|`）
- [x] 10.3 运行 `git diff --exit-code docs/generated/skills-index.md` 前置检查（提交前由 pre-commit hook 自动 stage）

## 11. 验证（阶段 6 入口）

- [x] 11.1 `grep -r "^---$" skills/*/SKILL.md | wc -l` 为 skill 数 ×2；所有新 description 为单行双引号
- [x] 11.2 逐文件 diff 审查：特有差异（jira 门控通病/--retry/--resume/state.json/opsx 归档说明）均在各自正文保留，未被误删
- [x] 11.3 触发词与 description 全文 diff 确认零改动；`npx -y @fission-ai/openspec validate extract-shared-workflow-skills` 通过
- [x] 11.4 模拟前置检查：确认 solve-workflow 缺失提示模板列出全部 9 个依赖
