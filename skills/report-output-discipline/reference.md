# Report Output Discipline — Reference

## Product registry

Single source of truth for artifact format decisions. Column order is fixed; the contract test parses this table.

- **Class**: `machine` | `dual` | `human`
- **Consumer evidence**: `machine` → grep pattern + hit location; `dual` → named agent consumption point; `human` (non-exception) → empty; exception rows → `既有契约（读取点见 …）`
- **Status**: `接入` | `sink 待定` | `未接入`

| Product | Producing skill | Class | Consumer evidence | Source | Derived | Path | Suppression | Status |
|---|---|---|---|---|---|---|---|---|
| 技术评审文档 | tech-review-doc | human | | md | html | `tech-review-{topic}-{YYYY-MM-DD}.md`（输入文档旁） | 宿主追加 `.html` 忽略行 | 接入 |
| 人工测试指南 | test-guide-from-code | human | | md | html | `<feature>_manual_test_guide_<YYYY-MM-DD>.md`（cwd） | 宿主追加 `.html` 忽略行 | 接入 |
| 发布报告 | git-release-finish | human | | md | html | `release-<VERSION>-report.md`（repo root） | 宿主追加 `.html` 忽略行 | 接入 |
| 队列任务卡 | goal-driven-queue | human | 既有契约（读取点见 `skills/goal-driven-queue/scripts/render-html.mjs` `readTrigger`） | md | html | `.goal-driven/queues/<queue-id>/<slug>.md` | 目标仓库 ignore `.goal-driven/**/*.html` | 未接入 |
| 队列 triage 记录 | goal-driven-queue | human | 既有契约（同上） | md | html | `.goal-driven/queues/<queue-id>/triage-<timestamp>.md` | 同上 | 未接入 |
| 队列进度文档 | goal-driven-queue | human | 既有契约（同上） | md | html | `.goal-driven/queues/<queue-id>/runs/<batch-id>/progress.md` | 同上 | 未接入 |
| 队列核对文档 | goal-driven-queue | human | 既有契约（同上） | md | html | `.goal-driven/queues/<queue-id>/runs/<batch-id>/verification.md` | 同上 | 未接入 |
| 验收包内引擎完成报告 | goal-driven-queue | human | 既有契约（同上） | md | html | `.goal-driven/queues/<queue-id>/runs/<batch-id>/reports/<card-slug>.md` | 同上 | 未接入 |
| 队列评审页与证据页 | goal-driven-queue | human | 既有契约（同上） | json | html | `.goal-driven/queues/<queue-id>/runs/<batch-id>/review/<card>.html` 等 | 同上 | 未接入 |
| 长跑评审页与证据页 | goal-driven-workflow | human | 既有契约（`renderReviewPage` / `renderEvidencePage`） | json | html | `.goal-driven/runs/<local-YYYYMMDD-HHmm>/review.html` 等 | 目标仓库 ignore `.goal-driven/**/*.html` | 未接入 |
| 概念解释页 | explain-clearly | human | 既有契约（自带 shell，无 md 真源） | html | | `.explain-clearly/<name>.html` | 目标仓库 ignore `.explain-clearly/*.html` | 未接入 |
| OpenSpec 四件套 | opsx-solve-workflow | machine | `openspec validate --changes`（AGENTS.md §验证命令） | md | | `openspec/changes/<name>/{proposal.md,design.md,tasks.md,specs/}` | 不适用 | 未接入 |
| OpenSpec 四件套 | opsx-jira-fix-workflow | machine | `openspec validate --changes`（AGENTS.md §验证命令） | md | | `openspec/changes/<name>/` | 不适用 | 未接入 |
| figma living artifact | figma-pixel-implement / figma-pixel-verify | machine | `check-figma-verify-report.mjs` 解析 `Channel` / `Screenshot` 字段 | md | | `docs/figma/<safe-frame-name>.md` | 不适用 | 未接入 |
| Jira 修复状态 | jira-fix-workflow | machine | `skills/jira-fix-workflow/SKILL.md` 中 `state.json` 恢复约定 | json | | `.jira-fix/<JIRA-ID>/state.json` | 不适用 | 未接入 |
| Android WebView 调试状态 | android-webview-debug | machine | `skills/android-webview-debug/SKILL.md` 中 revert 读取约定 | json | | `.android-webview-debug-state.json` | 不适用 | 未接入 |
| 长跑评审与证据输入 | goal-driven-workflow | machine | `renderReviewPage(` / `renderEvidencePage(` 字段读取 | json | | `.goal-driven/runs/<local-YYYYMMDD-HHmm>/` 同目录 | 不适用 | 未接入 |
| Jira 修复阶段记录 | jira-fix-workflow | dual | 下游阶段读取（`skills/jira-fix-workflow/SKILL.md` `--resume`） | md | | `.jira-fix/<JIRA-ID>/0*.md` | 不适用 | 未接入 |
| 上下文 ledger | context-budget-discipline | dual | 宿主下一阶段读取（`skills/context-budget-discipline/reference.md` `{ledger-path}`） | md | | `{ledger-path}`（宿主提供） | 不适用 | 未接入 |
| 设计文档 | brainstorm-workflow | dual | solve-workflow 阶段 5 读取 | md | | `docs/design/YYYY-MM-DD-<topic>-design.md` | 不适用 | 未接入 |
| 性能基准与场景 | perf-optimize-workflow | dual | 下一轮 campaign 读取（`BENCHMARK.md` 作为 campaign memory） | md | | `BENCHMARK.md` / `SCENARIOS.md` | 不适用 | 未接入 |
| 项目约定与术语 | learn-and-improve / domain-language-discipline | dual | 宿主会话启动加载（`AGENTS.md` / `CLAUDE.md` / `CONTEXT.md`） | md | | repo root | 不适用 | 未接入 |
| Jira 本地缓存 | jira-read | dual | 下游 jira-fix 阶段读取（`$JIRA_CACHE_DIR`） | md | | `$JIRA_CACHE_DIR/{JIRA-ID}.md` | 不适用 | 未接入 |
| 解包清单 | unbox-anything | dual | 下游 agent 分析提取链 | md | | `<outname>-unboxed/README.md` | 不适用 | 未接入 |
| 部署入口配置 | go-deploy | dual | 后续会话读取（`docs/deploy.md`） | md | | `docs/deploy.md` | 不适用 | 未接入 |
| 诊断报告 | essence-diagnosis | human | | md | html | 无固定路径 | | sink 待定 |
| 竞品调研报告族 | competitive-research | human | | md | html | 无固定路径 | | sink 待定 |
| 演化复盘 ledger | evolution-review | human | | md | html | 无固定路径 | | sink 待定 |
| 长跑完成报告 | goal-driven-workflow | human | | md | html | 对话输出 + `review.html` | 既有契约承载 | 未接入 |
| 阶段总结文档 | solve-workflow | human | | md | html | 无固定路径 | | sink 待定 |
| 复盘总结 | learn-and-improve | human | | md | html | 无固定路径 | | sink 待定 |

## Coverage whitelist

Skills with no registered product. Everything omitted here and absent from the table makes the coverage test fail.

**只写排除类产物**（源码/测试文件、版本声明、外部系统写回、证据截图、解包载荷、会话内脚本）：

- `ai-proxy-discipline`、`analysis-core`、`astrill-control`、`browser-debug-toolkit`、`clarifying-question-discipline`、`code-design-review`、`completion-evidence-discipline`、`decision-fog-discipline`、`delivery-discipline`、`design-approval-gate`、`effective-web-research`、`feature-branch-closeout`、`git-branch-protect`、`git-commit`、`git-conflict-resolve`、`git-release-start`、`git-worktree-discipline`、`hybrid-debug`、`intake-interview-discipline`、`jira-fix-queue`、`jira-status-writeback`、`jira-wiki-markup`、`known-issue-research`、`merge-discipline`、`multi-agent-debate`、`node-version-discipline`、`opsx-jira-fix-queue`、`opsx-workspace-gate`、`pr-code-review`、`report-output-discipline`、`runtime-evidence-debug`、`runtime-verification-discipline`、`session-cleanup`、`solution-review`、`staged-review-flow`、`test-first-discipline`、`test-suite-ensure`、`think-big`、`typescript-check`、`upstream-dependency-debug`、`workflow-mode-lifecycle`、`write-workflow`、`xquik-social-data`、`article-writer`

Whitelist changes must state the reason here:

- 2026-10-28 — initial list; each entry produces only an excluded class (source/test files, version declarations, external-system writes, evidence screenshots, unpacked payloads, or in-session scripts) or delegates its output to another skill that already has a registry row.
