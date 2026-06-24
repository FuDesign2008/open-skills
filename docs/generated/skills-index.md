# Skills 索引（自动生成）

> **请勿手改。** 由 `node scripts/gen-skill-docs.mjs` 从 `skills/<name>/SKILL.md` 生成。
> 
> 变更 skill 后：commit 时 pre-commit hook 自动更新；或手动执行 `node scripts/gen-skill-docs.mjs`

本仓库当前共 **24** 个 skill。

| Skill | 版本 | 用户可唤起 | 描述（含触发条件） |
| --- | --- | --- | --- |
| **android-webview-debug** | — | — | Android 工程内统一 WebView 远程调试开关。android-webview-debug-enable 将 setWebContentsDebuggingEnabled 全部设为 true 并记录修改位置与修改前内容；android-webview-debug-revert 按记录恢复，与记录不符的项在最后列出并等待人工确认。适用于需要统一开启或恢复 WebView 调试的 Android 项目。 |
| **article-writer** | 1.0.0 | — | Use when 用户想写公众号、知乎技术文章、自媒体内容，或基于已有技术文档改写为可发布文章时。 |
| **chinese-format** | 1.2.0 | 是 | 中文内容格式规范，供用户手动请求时使用。当用户明确说"中文格式"、"检查中文格式"、"中文标点检查"、"格式化中文"、"按中文格式规范处理"或"chinese-format"时触发。确保中文内容使用中文标点符号，技术术语保持原文格式。 |
| **ensure-tests** | 1.0.0 | 是 | 当用户说"ensure-tests"、"补全测试"、"生成测试"、"确保测试"、"补充单元测试"、"添加单元测试"、"检查测试覆盖"时触发。也可被 opsx-solve-workflow 等工作流在开发完成后调用，确保交付物包含单元测试（必须）和 E2E 测试（可选，按工程支持情况）。 |
| **essence-diagnosis** | 1.0.0 | 是 | Use when a complex problem seems unsolvable and needs digging to the essence — diagnosis only, not fixing. Symptoms include massive logs with no root cause surfaced, complex crashes, architectural essence analysis, requirement authenticity verification, systemic chronic issues, information overload, disconnect between symptoms and essence, multiple intertwined factors, or premature-convergence tendencies — even when the user never explicitly says "diagnose". Also triggers on 本质诊断, 根因诊断, 深度诊断, 诊断问题本质, 梳理问题逻辑, 证据链分析, 逻辑链分析, essence-diagnosis. |
| **frontend-perf** | 2.0.0 | 否 | 前端（含 Electron 桌面端）性能优化领域知识库，含 React 16-19、Angular 9-18+、Electron 12-28+ 版本专属优化知识。配合 perf-workflow skill 使用：perf-workflow 驱动分析流程，本 skill 提供前端专属量化标准、版本感知优化方案、瓶颈模式与工具速查。当分析 Web 前端（React/Angular/Vue）、Electron 桌面端性能问题时使用。 |
| **git-commit** | 3.0.0 | 是 | 当用户说「提交代码」「git commit」「帮我提交」「写 commit message」「生成 commit」「提交一下」「git-commit」「自动提交代码」「git-commit-auto」，或由 jira-fix-workflow 阶段7触发时使用。 |
| **git-conflict-resolve** | 1.0.0 | 是 | 当 Git merge 或 rebase 过程中出现代码冲突时使用，尤其适用于 AI 自动解冲突容易出错（取错侧、丢失重构、还原旧版代码）、需要语义分析和逻辑验证的场景。也适用于 rebase 多轮停止需跨轮聚合冲突文件的情况。触发词：解冲突、处理冲突、git-conflict-resolve、解决 merge 冲突、解决 rebase 冲突、conflict resolve、冲突解决。 |
| **git-release-finish** | 1.2.0 | 是 | Use when releasing a Git repository version — tagging, merging release branches into main, resolving conflicts, or syncing changes between release branches. Handles ambiguous tag naming (v-prefix vs plain), unknown main branch (master/main/develop), cross-release hash-sensitive rebase, and MR/PR extra file cleanup. GitLab, GitHub, Gitea; single or multi-repo. Triggers: 发版, 打tag, 发布版本, 版本发布, release流程, git-release, multi-repo release. |
| **git-release-start** | 1.0.0 | 是 | 当版本迭代开始时需要创建 release 分支时使用，适用于分支命名规范不统一、多仓库需同步创建、或需要确保本地 tracking 正确指向 origin/release/X.Y.Z 的场景。支持 GitLab、GitHub 等平台，单仓库和多仓库均可。触发词：创建release分支、开release分支、开分支、迭代分支、create release branch。 |
| **go-deploy** | 1.0.0 | 是 | 打开项目的部署平台链接。当用户说「去部署」「部署平台」「准备部署」时触发，即使用户没有明确说「打开链接」，只要意图是访问部署控制台或发布平台就应触发。Skill 自动读取项目中的 docs/deploy.md 获取部署链接；若不存在则扫描工程文档提取信息并生成；若扫描无果则提示用户补充。支持一个工程多个部署链接的场景。 |
| **jira-fix-batch** | 1.1.0 | 是 | 当用户说「批量修复」「批量 jira-fix」「jira-fix-batch」「批量修复多个 Jira」「批量修复以下 bug」时触发。适用于需要对多个 Jira issue 进行批量端到端修复的编排场景。 |
| **jira-fix-workflow** | 3.12.0 | 是 | 当用户说「修复这个 bug [URL]」「帮我修复 [URL]」「jira-fix [URL]」「自动修复 [URL]」「强制修复 [URL]」「继续修复」「从上次继续」时触发。适用于从 Jira 链接出发、对单个 bug 进行端到端修复的场景。 |
| **jira-read** | 3.0.0 | 是 | 当用户说"jira-read [JIRA-ID]"，或需要读取、获取、下载 Jira issue 数据时触发。需配置 $JIRA_CACHE_DIR（如 ~/.cache/jira）。 |
| **multi-agent-debate** | — | — | Stress-test a crash analysis, hypothesis, or technical conclusion by launching three adversarial agents in parallel — one defends, one attacks, one hunts new evidence — and resolving disputes with physical proof instead of argument. Always use this skill when the analysis has 2+ competing explanations that both seem plausible, when a conclusion relies on a single log sample or inferred chain longer than 3 steps, or when someone says "are you sure?", "that doesn't sound right", or challenges an assumption. Triggers: 辩论、求真、挑战假设、质疑分析、multi-agent-debate, "debate this", "challenge my analysis", "find holes in", "I'm not sure this is right", "verify this". |
| **opsx-jira-fix-batch** | 1.2.0 | 是 | 当用户说「opsx 批量修复」「批量 opsx-jira-fix」「opsx-jira-fix-batch」「批量 OpenSpec Jira 修复」时触发。适用于需要对多个 Jira issue 进行批量端到端修复并将关系判断沉淀到 OpenSpec artifacts 的编排场景。 |
| **opsx-jira-fix-workflow** | 1.4.0 | 是 | 当用户说"opsx-jira-fix"、"OpenSpec Jira 修复"、"规范化修复 Jira"、"opsx修复Jira"、"Jira OpenSpec 修复"、"opsx自动修复Jira"、"用OpenSpec修复Jira"或"opsx-jira-fix-workflow"时触发。适用于从 Jira issue 出发，并需要将根因、行为变更、修复计划、验证和归档沉淀到 OpenSpec artifacts 的端到端 Bug 修复。 |
| **opsx-solve-workflow** | 1.4.0 | 是 | 当用户说"opsx解决"、"OpenSpec解决"、"规范化解决"、"创建OpenSpec变更"、"创建opsx变更"、"用OpenSpec分析"、"用OpenSpec修复"、"opsx自动解决"、"OpenSpec自动解决"、"opsx-solve"或"opsx-solve-workflow"时触发。适用于需要将分析、方案、计划、实现、验证和归档沉淀到OpenSpec artifacts的功能开发、Bug修复、重构和复杂工程任务。 |
| **perf-workflow** | 2.2.0 | 是 | 性能问题分析与优化工作流，共六阶段。触发词均以「性能」开头：性能分析、性能证据、性能定位、性能假设、性能监控、性能优化、性能验证、性能深入。当用户说上述词或使用「触发词： 具体描述」形式时，进入本工作流或对应阶段。 |
| **solve-workflow** | 1.9.0 | 是 | 当用户说"明确问题"、"分析问题"、"探索方案"、"审查方案"、"制定计划"、"执行计划"、"检查验证"、"回顾总结"，或"继续分析"、"深入分析"、"修改方案"、"完善方案"、"优化方案"、"更新计划"、"修订计划"、"修改计划"，或"自动模式"、"自动分析"、"自动解决"时触发。适用于 bug 修复、代码重构、功能开发等需系统性分析的复杂任务。 |
| **test-guide-from-code** | 1.1.0 | 是 | 根据代码变更（diff、commit、MR/PR）生成面向人工测试人员的手工测试指南。Use when 用户说「生成测试指南」「测试指南」「人工测试指南」「测试指引」「test guide」「根据代码生成测试」「从 MR 生成测试指南」「从 PR 生成测试指南」，或提供 diff/MR/PR 链接并要求生成测试指南时触发。 |
| **think-big** | 1.0.0 | 是 | Use when 用户需要从战略视角分析一件事——想清楚要不要做、值不值得做、风险在哪、长远影响是什么。触发词：战略思考、战略分析、从战略角度看、战略视角、帮我想清楚这件事、这件事值不值得做、从更高视角分析、think-big、strategic thinking、strategy。不适用于执行细节规划（那是战术层）。 |
| **typescript-check** | 1.0.0 | 是 | TypeScript 类型检查流程。当用户说"类型检查"、"type-check"、"tsc"或需要检查 TypeScript 类型错误时触发。 |
| **xquik-social-data** | 1.0.0 | 是 | Use when 用户需要从 Xquik 获取公开 X/Twitter 数据、搜索推文、查账号、看趋势、导出样本、整理社媒证据，或说 xquik、Xquik、X/Twitter data、tweet search、social evidence、社媒证据、推文搜索。 |

---

## 校验

```bash
node scripts/gen-skill-docs.mjs
git diff --exit-code docs/generated/skills-index.md
```
