# Report Output Discipline — Reference

## Product registry

Single source of truth for artifact format decisions. Column order is fixed and the contract test parses this table.

- **Class**: `machine` | `dual` | `human`
- **Consumer evidence**: `machine` → the program read point as `path:line` (with the field or protocol it reads); `dual` → the agent consumption point as `path:line`; `human` (non-exception) → empty; exception rows → `既有契约（read point path:line）`
- **Status**: `接入` | `sink 待定` | `未接入`

| Product | Producing skill | Class | Consumer evidence | Source | Derived | Path | Suppression | Status |
|---|---|---|---|---|---|---|---|---|
| 技术评审文档 | tech-review-doc | human | | md | html | `tech-review-{topic}-{YYYY-MM-DD}.md` beside the input document | Host appends an `.html` ignore line | 接入 |
| 人工测试指南 | test-guide-from-code | human | | md | html | `<feature>_manual_test_guide_<YYYY-MM-DD>.md` in the working directory | Host appends an `.html` ignore line | 接入 |
| 发布报告 | git-release-finish | human | | md | html | `release-<VERSION>-report.md` at the repository root | Host appends an `.html` ignore line | 接入 |
| 队列任务卡 | goal-driven-queue | human | 既有契约（read point <goal-driven-queue-skill-dir>/scripts/render-html.mjs:285） | md | html | `.goal-driven/queues/<queue-id>/<slug>.md` | Host appends `.goal-driven/**/*.html` | 未接入 |
| 队列 triage 记录 | goal-driven-queue | human | 既有契约（read point <goal-driven-queue-skill-dir>/scripts/render-html.mjs:285） | md | html | `.goal-driven/queues/<queue-id>/triage-<timestamp>.md` | Host appends `.goal-driven/**/*.html` | 未接入 |
| 队列进度文档 | goal-driven-queue | human | 既有契约（read point <goal-driven-queue-skill-dir>/scripts/render-html.mjs:529） | md | html | `.goal-driven/queues/<queue-id>/runs/<batch-id>/progress.md` | Host appends `.goal-driven/**/*.html` | 未接入 |
| 队列核对文档 | goal-driven-queue | human | 既有契约（read point <goal-driven-queue-skill-dir>/scripts/render-html.mjs:285） | md | html | `.goal-driven/queues/<queue-id>/runs/<batch-id>/verification.md` | Host appends `.goal-driven/**/*.html` | 未接入 |
| 验收包内引擎完成报告 | goal-driven-queue | human | 既有契约（read point <goal-driven-queue-skill-dir>/scripts/render-html.mjs:285） | md | html | `.goal-driven/queues/<queue-id>/runs/<batch-id>/reports/<card-slug>.md` | Host appends `.goal-driven/**/*.html` | 未接入 |
| 队列评审页与证据页 | goal-driven-queue | human | 既有契约（read point <goal-driven-queue-skill-dir>/scripts/render-html.mjs:426） | json | html | `.goal-driven/queues/<queue-id>/runs/<batch-id>/review/<card>.html` | Host appends `.goal-driven/**/*.html` | 未接入 |
| 长跑评审页与证据页 | goal-driven-workflow | human | 既有契约（read point <goal-driven-queue-skill-dir>/scripts/render-html.mjs:458） | json | html | `.goal-driven/runs/<local-YYYYMMDD-HHmm>/review.html` | Host appends `.goal-driven/**/*.html` | 未接入 |
| 概念解释页 | explain-clearly | human | 既有契约（read point <explain-clearly-skill-dir>/SKILL.md:59） | html | | `.explain-clearly/<name>.html` | Not applicable — the owning capability forbids editing the workspace gitignore | 未接入 |
| OpenSpec 四件套 | opsx-solve-workflow / opsx-jira-fix-workflow | machine | `openspec validate` parses proposal/specs/tasks fields (<opsx-solve-workflow-skill-dir>/SKILL.md:143 and <opsx-jira-fix-workflow-skill-dir>/SKILL.md:345) | md | | `openspec/changes/<name>/` | Not applicable | 未接入 |
| figma living artifact | figma-pixel-implement / figma-pixel-verify | machine | `<figma-pixel-verify-skill-dir>/scripts/check-figma-verify-report.mjs:194` reads the Channel and Screenshot fields | md | | `docs/figma/<safe-frame-name>.md` | Not applicable | 未接入 |
| Jira 修复状态 | jira-fix-workflow | dual | The agent resumes from `current_phase` (<jira-fix-workflow-skill-dir>/SKILL.md:119) | json | | `.jira-fix/<JIRA-ID>/state.json` | Not applicable | 未接入 |
| Android WebView 调试状态 | android-webview-debug | dual | The agent restores from the recorded locations (<android-webview-debug-skill-dir>/SKILL.md:13) | json | | `.android-webview-debug-state.json` | Not applicable | 未接入 |
| Jira 修复阶段记录 | jira-fix-workflow | dual | The resume path reads the checkpoint files (<jira-fix-workflow-skill-dir>/SKILL.md:54) | md | | `.jira-fix/<JIRA-ID>/0*.md` | Not applicable | 未接入 |
| 上下文 ledger | context-budget-discipline | dual | The host's next phase reads `{ledger-path}` (<context-budget-discipline-skill-dir>/SKILL.md:36) | md | | `{ledger-path}` supplied by the host | Not applicable | 未接入 |
| 设计文档 | brainstorm-workflow | dual | Handed to the Make a Plan stage (<brainstorm-workflow-skill-dir>/SKILL.md:58) | md | | `docs/design/YYYY-MM-DD-<topic>-design.md` | Not applicable | 未接入 |
| 性能基准与场景 | perf-optimize-workflow | dual | The next campaign feeds on its invalidation rows and negative results (<perf-optimize-workflow-skill-dir>/SKILL.md:320) | md | | `BENCHMARK.md` / `SCENARIOS.md` | Not applicable | 未接入 |
| 项目约定与术语 | learn-and-improve / domain-language-discipline | dual | The host loads it at session start (<learn-and-improve-skill-dir>/SKILL.md:62) and when domain language is in play (<domain-language-discipline-skill-dir>/SKILL.md:26) | md | | repository root | Not applicable | 未接入 |
| Jira 本地缓存 | jira-read | dual | Downstream Jira stages read `$JIRA_CACHE_DIR` (<jira-read-skill-dir>/SKILL.md:10) | md | | `$JIRA_CACHE_DIR/{JIRA-ID}.md` | Not applicable | 未接入 |
| 解包清单 | unbox-anything | dual | The downstream agent reads the extraction chain (<unbox-anything-skill-dir>/SKILL.md:114) | md | | `<outname>-unboxed/README.md` | Not applicable | 未接入 |
| 部署入口配置 | go-deploy | dual | Later sessions read it (<go-deploy-skill-dir>/SKILL.md:20) | md | | `docs/deploy.md` | Not applicable | 未接入 |
| 长跑评审输入 | goal-driven-workflow | human | | json | | `.goal-driven/runs/<local-YYYYMMDD-HHmm>/review.json` | Not applicable | 未接入 |
| 长跑证据输入 | goal-driven-workflow | human | | json | | `.goal-driven/runs/<local-YYYYMMDD-HHmm>/evidence.json` | Not applicable | 未接入 |
| 诊断报告 | essence-diagnosis | human | | md | html | No fixed path | Not applicable | sink 待定 |
| 竞品调研报告族 | competitive-research | human | | md | html | No fixed path | Not applicable | sink 待定 |
| 演化复盘 ledger | evolution-review | human | | md | html | No fixed path | Not applicable | sink 待定 |

## Coverage whitelist

Skills with no registered product. A skill absent from both this list and the table fails the coverage test.

These produce only excluded classes — source or test files, version declarations, external-system writes, evidence screenshots, unpacked payloads, in-session scripts — or delegate their output to a skill that already holds a row:

- `ai-proxy-discipline`, `analysis-core`, `article-writer`, `astrill-control`, `browser-debug-toolkit`, `clarifying-question-discipline`, `code-design-review`, `completion-evidence-discipline`, `decision-fog-discipline`, `delivery-discipline`, `design-approval-gate`, `effective-web-research`, `feature-branch-closeout`, `git-branch-protect`, `git-commit`, `git-conflict-resolve`, `git-release-start`, `git-worktree-discipline`, `hybrid-debug`, `intake-interview-discipline`, `jira-fix-queue`, `jira-status-writeback`, `jira-wiki-markup`, `known-issue-research`, `merge-discipline`, `multi-agent-debate`, `node-version-discipline`, `opsx-jira-fix-queue`, `opsx-workspace-gate`, `pr-code-review`, `report-output-discipline`, `runtime-evidence-debug`, `runtime-verification-discipline`, `session-cleanup`, `solve-workflow`, `solution-review`, `staged-review-flow`, `test-first-discipline`, `test-suite-ensure`, `think-big`, `typescript-check`, `upstream-dependency-debug`, `workflow-mode-lifecycle`, `write-workflow`, `xquik-social-data`

Whitelist changes record their reason here:

- 2026-10-29 — initial list; each entry produces only an excluded class, or delegates its output to another skill that already holds a row. `solve-workflow` is listed because its only persisted artifact is the context-budget ledger, which that skill holds.

## Renderer

The shared renderer lives at `scripts/render-core.mjs` in this skill. Hosts resolve it from this skill's installation directory and call:

```
node <skill-dir>/scripts/render-core.mjs <source.md> [--root <dir>] [--at <iso>]
```

Mermaid `flowchart` fences become inline SVG; anything outside the supported subset degrades the whole graph with a visible marker while keeping the source.
