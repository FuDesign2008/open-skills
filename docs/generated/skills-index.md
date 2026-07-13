# Skills 索引（自动生成）

> **请勿手改。** 由 `node scripts/gen-skill-docs.mjs` 从 `skills/<name>/SKILL.md` 生成。
> 
> 变更 skill 后：commit 时 pre-commit hook 自动更新；或手动执行 `node scripts/gen-skill-docs.mjs`

本仓库当前共 **31** 个 skill。

| Skill | 版本 | 用户可唤起 | 描述（含触发条件） |
| --- | --- | --- | --- |
| **android-webview-debug** | 1.0.0 | 是 | Toggle WebView remote debugging for Android projects — enable sets all setWebContentsDebuggingEnabled to true and records locations; revert restores from the record. Triggers — 「开启 WebView 调试」「恢复 WebView 调试」 / android-webview-debug-enable, android-webview-debug-revert. |
| **article-writer** | 1.0.0 | 是 | Use when 用户想写公众号、知乎技术文章、自媒体内容，或基于已有技术文档改写为可发布文章时。 |
| **browser-debug-toolkit** | 1.1.0 | 是 | Browser runtime debugging toolkit — guides AI to prioritize browser DevTools, CDP-based MCP tools (chrome-devtools-mcp), and Playwright for runtime inspection when debugging UI/CSS/DOM layout, frontend interaction, and rendering issues, rather than relying solely on static code analysis. Triggers: 「浏览器调试」「UI 调试」「DOM 检查」「CSS 调试」「页面布局问题」「前端运行时调试」「chrome devtools」「CDP 调试」 / browser debug, devtools, dom inspect, css debug, runtime debugging |
| **code-design-review** | 1.0.0 | 是 | Review design quality of proposed code changes before implementation — code metrics (complexity, coupling, cohesion), architecture attributes (testability, modularity), and a security pass. Triggers — 「代码设计审查」「代码设计质量」「审查代码设计」「代码架构审查」「代码质量评审」「这个代码设计合理吗」「耦合度审查」「代码可维护性」 / code design review. |
| **effective-web-research** | 1.0.0 | 是 | Web research discipline for AI agents — route first (external vs internal), then 4 maxims by default (official first, recency, cross-validate, skip content farms); full source-credibility evaluation on strict requests. Triggers — 「web 调研」「外部调研」「查资料」「有效调研」「严格调研」「深度调研」「严格查证」「有没有漏洞」 / web research, fact-check. Not for local search. |
| **ensure-tests** | 1.0.0 | 是 | Ensure the current project has a proper test suite — detect tech stack & framework, scaffold if needed, generate unit tests (required, logic code only), and optionally generate/run E2E tests. Triggers when user says "ensure-tests", 「补全测试」「生成测试」「确保测试」「补充单元测试」「添加单元测试」「检查测试覆盖」 (complete tests / generate tests / ensure tests / add unit tests / check test coverage). Also callable by opsx-solve-workflow at the end of phase 5. |
| **essence-diagnosis** | 1.0.0 | 是 | Diagnose the essence of a complex, seemingly unsolvable problem — diagnosis only, not fixing. Use for massive logs with no root cause, complex crashes, architectural essence analysis, requirement verification, systemic chronic issues. Triggers — 本质诊断、根因诊断、深度诊断、诊断问题本质、梳理问题逻辑、证据链分析、逻辑链分析 / essence-diagnosis. |
| **frontend-perf** | 2.0.0 | 否 | 前端（含 Electron 桌面端）性能优化领域知识库，含 React 16-19、Angular 9-18+、Electron 12-28+ 版本专属优化知识。配合 perf-workflow skill 使用：perf-workflow 驱动分析流程，本 skill 提供前端专属量化标准、版本感知优化方案、瓶颈模式与工具速查。当分析 Web 前端（React/Angular/Vue）、Electron 桌面端性能问题时使用。 |
| **git-commit** | 3.0.0 | 是 | Git commit unified entry point. Triggers when user says 「提交代码」「git commit」「帮我提交」「写 commit message」「生成 commit」「提交一下」「git-commit」「自动提交代码」「git-commit-auto」 (commit code / help me commit / write commit message / generate commit / auto commit), or when invoked by jira-fix-workflow phase 7. |
| **git-conflict-resolve** | 1.1.0 | 是 | 当 Git merge 或 rebase 过程中出现代码冲突时使用，尤其适用于 AI 自动解冲突容易出错（取错侧、丢失重构、还原旧版代码）、需要语义分析和逻辑验证的场景。也适用于 rebase 多轮停止需跨轮聚合冲突文件的情况。触发词：解冲突、处理冲突、git-conflict-resolve、解决 merge 冲突、解决 rebase 冲突、conflict resolve、冲突解决。 |
| **git-release-finish** | 1.4.0 | 是 | Use when releasing a Git repository version — tagging, merging release branches into main, resolving conflicts, or syncing changes between release branches. Handles ambiguous tag naming (v-prefix vs plain), unknown main branch (master/main/develop), cross-release hash-sensitive rebase, and MR/PR extra file cleanup. GitLab, GitHub, Gitea; single or multi-repo. Triggers: 发版, 打tag, 发布版本, 版本发布, release流程, git-release, multi-repo release. |
| **git-release-start** | 1.0.0 | 是 | 当版本迭代开始时需要创建 release 分支时使用，适用于分支命名规范不统一、多仓库需同步创建、或需要确保本地 tracking 正确指向 origin/release/X.Y.Z 的场景。支持 GitLab、GitHub 等平台，单仓库和多仓库均可。触发词：创建release分支、开release分支、开分支、迭代分支、create release branch。 |
| **go-deploy** | 1.0.0 | 是 | Open the project's deployment platform link. Triggers when user says 「去部署」「部署平台」「准备部署」 (go deploy / deploy platform / prepare to deploy) — even without explicitly saying "open link", as long as the intent is to access a deployment console or release platform. The skill reads docs/deploy.md for deployment links; if absent, scans project docs to extract and generate config; if nothing found, prompts user to provide. Supports multiple deployment links per project. |
| **hybrid-debug** | 1.0.0 | 是 | Hybrid app (native + WebView/Electron + H5) full-stack debugging across four layers — prevents whack-a-mole surface fixes. Use for hybrid UI/theme/behavior issues, platform discrepancies, silent native-H5 failures. Triggers — 「hybrid 调试」「跨端调试」「全链路调试」「平台差异调试」「WebView 问题」「WKWebView 问题」「native 和 H5 交互问题」「单端修复失败」 / hybrid debug. |
| **jira-fix-batch** | 1.1.0 | 是 | 当用户说「批量修复」「批量 jira-fix」「jira-fix-batch」「批量修复多个 Jira」「批量修复以下 bug」时触发。适用于需要对多个 Jira issue 进行批量端到端修复的编排场景。 |
| **jira-fix-workflow** | 3.13.0 | 是 | 当用户说「修复这个 bug [URL]」「帮我修复 [URL]」「jira-fix [URL]」「自动修复 [URL]」「强制修复 [URL]」「继续修复」「从上次继续」时触发。适用于从 Jira 链接出发、对单个 bug 进行端到端修复的场景。 |
| **jira-read** | 3.0.0 | 是 | Read Jira issue data from local cache or API. Triggers when user says "jira-read [JIRA-ID]", 「读取 Jira」「查看 Jira」「下载 Jira」 (read/view/download Jira), or needs to fetch Jira issue data. Requires $JIRA_CACHE_DIR (e.g. ~/.cache/jira). |
| **multi-agent-debate** | 1.0.0 | 是 | Stress-test an analysis or hypothesis with three adversarial agents — defend, attack, hunt new evidence — resolving disputes with physical proof. Use when 2+ competing explanations both seem plausible, or a conclusion rests on a single log or inferred chain. Triggers — 辩论、求真、挑战假设、质疑分析、multi-agent-debate, debate this, challenge my analysis, are you sure? |
| **opsx-jira-fix-batch** | 1.2.0 | 是 | 当用户说「opsx 批量修复」「批量 opsx-jira-fix」「opsx-jira-fix-batch」「批量 OpenSpec Jira 修复」时触发。适用于需要对多个 Jira issue 进行批量端到端修复并将关系判断沉淀到 OpenSpec artifacts 的编排场景。 |
| **opsx-jira-fix-workflow** | 1.5.0 | 是 | 当用户说"opsx-jira-fix"、"OpenSpec Jira 修复"、"规范化修复 Jira"、"opsx修复Jira"、"Jira OpenSpec 修复"、"opsx自动修复Jira"、"用OpenSpec修复Jira"或"opsx-jira-fix-workflow"时触发。适用于从 Jira issue 出发，并需要将根因、行为变更、修复计划、验证和归档沉淀到 OpenSpec artifacts 的端到端 Bug 修复。 |
| **opsx-solve-workflow** | 1.5.0 | 是 | 当用户说"opsx解决"、"OpenSpec解决"、"规范化解决"、"创建OpenSpec变更"、"创建opsx变更"、"用OpenSpec分析"、"用OpenSpec修复"、"opsx自动解决"、"OpenSpec自动解决"、"opsx-solve"或"opsx-solve-workflow"时触发。适用于需要将分析、方案、计划、实现、验证和归档沉淀到OpenSpec artifacts的功能开发、Bug修复、重构和复杂工程任务。 |
| **perf-workflow** | 2.2.0 | 是 | 性能问题分析与优化工作流，共六阶段。触发词均以「性能」开头：性能分析、性能证据、性能定位、性能假设、性能监控、性能优化、性能验证、性能深入。当用户说上述词或使用「触发词： 具体描述」形式时，进入本工作流或对应阶段。 |
| **runtime-evidence-debug** | 1.0.0 | 是 | Escalate from static analysis to runtime evidence when root cause is unconfirmed — instrumentation, reproduction, evidence analysis, confidence gating, escape hatch. Use when static hits a wall or a prior fix failed. Triggers — 「打点调试」「运行时调试」「复现验证」「日志分析根因」「根因置信度不足」「静态分析碰壁」「需要打点」 / runtime evidence debugging. |
| **solution-review** | 1.0.0 | 是 | Stress-test any proposed solution (code, config, architecture) before implementation — effectiveness, risks, feasibility, plus strategic dimensions (reversibility, failure modes, operability). Triggers — 「方案评审」「评估方案」「方案可行吗」「这个方案靠谱吗」「方案有没有风险」「设计评审」「决策评审」 / solution review, proposal review. |
| **solve-workflow** | 1.11.0 | 是 | 当用户说"明确问题"、"分析问题"、"探索方案"、"审查方案"、"制定计划"、"执行计划"、"检查验证"、"回顾总结"，或"继续分析"、"深入分析"、"修改方案"、"完善方案"、"优化方案"、"更新计划"、"修订计划"、"修改计划"，或"自动模式"、"自动分析"、"自动解决"时触发。适用于 bug 修复、代码重构、功能开发等需系统性分析的复杂任务。 |
| **test-guide-from-code** | 1.1.0 | 是 | Generate a manual test guide for human testers from code changes (diff, commit, MR/PR). Triggers when user says 「生成测试指南」「测试指南」「人工测试指南」「测试指引」「test guide」「根据代码生成测试」「从 MR 生成测试指南」「从 PR 生成测试指南」 (generate test guide / manual test guide / test guide from code / from MR / from PR), or provides a diff/MR/PR link and asks for a test guide. |
| **think-big** | 1.0.0 | 是 | Strategic thinking framework — analyze whether something is worth doing, what the risks are, and what the long-term impact will be. Use when user says 「战略思考」「战略分析」「从战略角度看」「战略视角」「帮我想清楚这件事」「这件事值不值得做」「从更高视角分析」 / think-big, strategic thinking, strategy. Not for execution-level planning (that's tactical). |
| **typescript-check** | 1.0.0 | 是 | TypeScript type-checking workflow. Use this skill whenever the user works with TypeScript and mentions type errors, type checking, or says "类型检查" (type check), "type-check", "tsc", "检查类型" — even if they don't explicitly ask for a "type check" but are encountering compilation or type issues in a TypeScript project. |
| **unbox-anything** | 1.0.0 | 是 | Universal file/container unpacker — crack ~30 'box-like' formats (.exe/.docx/.apk/.asar/.dmg/.deb/.jar/.iso + archives) into clean directories with a manifest, cross-platform via 7z. Triggers — 「拆箱」「开箱」「解压文件」「拆包」「解压任意文件」「提取容器内容」「拆开[文件]」「看[文件]里面」 / unbox, unpack any file. Not for writing extraction code. |
| **upstream-dependency-debug** | 1.1.0 | 是 | When a bug involves a named third-party library/framework, evaluate upgrading the dependency BEFORE piling on workarounds — 4-step decision, upgrade discipline, result table. Use when a bug smells upstream (version-tied symptoms, silent failures). Triggers — 「升级依赖」「依赖升级修复」「这个 bug 升级依赖能解决吗」「查 changelog 修复」「优先升级依赖」 / upgrade to fix bug. |
| **xquik-social-data** | 1.0.0 | 是 | Use when 用户需要从 Xquik 获取公开 X/Twitter 数据、搜索推文、查账号、看趋势、导出样本、整理社媒证据，或说 xquik、Xquik、X/Twitter data、tweet search、social evidence、社媒证据、推文搜索。 |

---

## 校验

```bash
node scripts/gen-skill-docs.mjs
git diff --exit-code docs/generated/skills-index.md
```
