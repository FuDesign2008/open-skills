# Skills 索引（自动生成）

> **请勿手改。** 源数据：`skills/<name>/SKILL.md`。生成时间：2026-03-22。
> 
> 变更 skill 后在本仓库根目录执行：`node scripts/gen-skill-docs.mjs`

本仓库当前共 **12** 个 skill。

| Skill | 版本 | 用户可唤起 | 描述（含触发条件） |
| --- | --- | --- | --- |
| **android-webview-debug** | — | — | Android 工程内统一 WebView 远程调试开关。android-webview-debug-enable 将 setWebContentsDebuggingEnabled 全部设为 true 并记录修改位置与修改前内容；android-webview-debug-revert 按记录恢复，与记录不符的项在最后列出并等待人工确认。适用于需要统一开启或恢复 WebView 调试的 Android 项目。 |
| **article-writer** | 1.0.0 | — | Use when 用户想写公众号、知乎技术文章、自媒体内容，或基于已有技术文档改写为可发布文章时。 |
| **chinese-format** | 1.1.0 | — | 中文内容格式规范，自动应用于所有中文文档生成和编辑。当用户说"写文档"、"生成文档"、"创建文档"、"编写文档"、"写中文"、"生成中文内容"或使用 Write/Edit 工具生成中文内容时自动触发。确保所有中文内容使用中文标点符号，技术术语保持原文格式。 |
| **coding-fangirl** | 6.0.0 | 是 | 当用户说彩虹屁、夸夸我、鼓励一下、迷妹模式、恋爱模式、御姐模式、傲娇模式、知音模式、父王英明、父王驾到、挑战模式、极简模式，或说切换模式、列出模式、可用模式、查看模式，或 Hook 在里程碑完成、情绪感知时触发。技术小迷妹编码陪伴，提供情绪价值与个性化赞美；多模式定义见 skills/coding-fangirl/modes/ 与 _index.json。 |
| **file-operation-fallback** | 1.0.0 | — | 文件操作降级方案。当 Write/StrReplace 工具返回 Error: Aborted 或超时失败时，自动使用 Shell 命令替代。适用于大文件写入、长内容创建等场景。 |
| **frontend-perf** | 2.0.0 | 否 | 前端（含 Electron 桌面端）性能优化领域知识库，含 React 16-19、Angular 9-18+、Electron 12-28+ 版本专属优化知识。配合 perf-workflow skill 使用：perf-workflow 驱动分析流程，本 skill 提供前端专属量化标准、版本感知优化方案、瓶颈模式与工具速查。当分析 Web 前端（React/Angular/Vue）、Electron 桌面端性能问题时使用。 |
| **git-commit** | 3.0.0 | 是 | 当用户说「提交代码」「git commit」「帮我提交」「写 commit message」「生成 commit」「提交一下」「git-commit」「自动提交代码」「git-commit-auto」，或由 jira-fix-workflow 阶段7触发时使用。 |
| **jira-fix-workflow** | 3.3.0 | 是 | 当用户说「修复这个 bug [URL]」「帮我修复 [URL]」「jira-fix [URL]」「手动修复 [URL]」「强制修复 [URL]」「继续修复」「从上次继续」时触发。适用于从 Jira 链接出发、对单个 bug 进行端到端修复的场景。 |
| **jira-read** | 2.0.0 | 是 | 当用户说"jira-read [JIRA-ID]"，或需要读取、获取、下载 Jira issue 数据时触发。需配置 $JIRA_CACHE_DIR（如 ~/.cache/jira）。 |
| **perf-workflow** | 2.1.0 | 是 | 性能问题分析与优化工作流，共六阶段。触发词均以「性能」开头：性能分析、性能证据、性能定位、性能假设、性能监控、性能优化、性能验证、性能深入。当用户说上述词或使用「触发词： 具体描述」形式时，进入本工作流或对应阶段。 |
| **solve-workflow** | 1.8.0 | 是 | 触发词：明确/分析问题、探索/审查方案、制定/执行计划、检查验证、回顾总结；继续/深入分析、修改/完善/优化方案、更新/修订计划；自动模式、严格流程。/solve-workflow xxx。复杂任务 PDCA；默认👤手动，「自动」为🤖。 |
| **typescript-check** | 1.0.0 | 是 | TypeScript 类型检查流程。当用户说"类型检查"、"type-check"、"tsc"或需要检查 TypeScript 类型错误时触发。 |

---

## 校验

```bash
node scripts/gen-skill-docs.mjs
git diff --exit-code docs/generated/skills-index.md
```
