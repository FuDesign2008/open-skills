# Proposal: add-ai-env-verification

## Why

本工程 PDCA 工作流的验证环节默认把非平凡验证列成清单交还人执行（solve-workflow/SKILL.md:309、opsx-solve-workflow/SKILL.md:302 的「AI cannot execute → tell the user to run it yourself」二分），即便其中大量验证本可由 AI 在模拟或真实环境中亲自完成。后果有三：验证劳动被系统性推回用户；AI 的环境自动化能力被闲置；「交还人」缺乏环境分层概念与边界判定，易被滥用为偷懒借口。本变更建立一个统一的「AI 驱动环境验证」纪律，让所有工作流的验证默认由 AI 在合适环境亲自执行（真实优先、模拟兜底、可插拔提供者），仅在真硬边界才交还人——从而减少人工验证劳动且不牺牲验证真实性。

## What Changes

- 新增纪律 skill `runtime-verification-discipline`（`user-invocable: false`，host 经 frontmatter `dependencies` 强引用、缺失即中止）。契约内容：
  - **环境分层模型**：真实/模拟相对 app 生产目标（Web→真浏览器为真实；Electron→该 app 为真实、纯浏览器为模拟；移动→物理真机为真实、模拟器/浏览器为模拟）。
  - **选层规则**（置信度 vs 成本权衡）：优先「AI 能零人工驱动、且对该断言足够确定 + 足够安全」的最高保真层；涉及写操作或易 flaky 的检查走「模拟先验 → 真实确认 → 如实标注」，只读且高确定的检查才可真实一步到底。
  - **提供者解析**（约定优于配置）：工程自带验证脚本/skill（规范的可发现约定）→ 本工程能力 skill（browser-debug-toolkit 等）→ 诚实交还。
  - **attempt-first + A/B/C 失败分类**：默认先尝试执行；失败归类为 A（没接线→当场接/提议接）/ B（缺一次性环境→给命令由用户定）/ C（真硬边界→交还必须给理由；C 含三类——无法行动、无法判定结果、有真实世界副作用）。
  - **充分性判据**作为核对义务第 1 条：验证须以「软件真实被使用的方式」覆盖本次改动的确切行为。
  - **诚实分层标注**（从属条款、非门禁）：报告标注所用验证层；低于生产目标层时标注「模拟已验，真实环境建议人补冒烟」。
- 4 个 PDCA host 的验证环节改为经 `dependencies` 引用该纪律并按其标准执行，替换/对齐各自「交还人」措辞（solve/opsx-solve 替换二分原文；opsx-jira-fix 替换「manual-verification items」措辞；jira-fix 新增引用）。
- 在 `runtime-verification-discipline` 与 `completion-evidence-discipline` 正文互相标注正交关系（新鲜度轴 × 环境/执行者轴）。
- AGENTS.md「Skill 清单」表登记新 skill 及其被 4 个 host 依赖的关系。

## Capabilities

### New Capabilities

- `runtime-verification-discipline`: AI 驱动环境验证的纪律契约——环境分层模型、选层规则（真实优先带确定性/安全限定）、可插拔提供者解析、attempt-first 与 A/B/C 失败分类、验证充分性判据、诚实分层标注。

### Modified Capabilities

- `opsx-solve-workflow`: 验证环节（Stage 7）由「AI 能跑就跑、否则交还用户」的二分，改为引用并遵循 `runtime-verification-discipline`（默认 AI 环境验证，仅真硬边界交还）。
- `jira-fix-workflow`: 验证环节（Stage 8）新增对 `runtime-verification-discipline` 的引用与遵循。
- `opsx-jira-fix-workflow`: 验证环节的「manual-verification items」默认姿态对齐到新纪律——验证默认由 AI 在环境执行，仅真硬边界才列为人工验证项。

> 说明：`solve-workflow` 在 `openspec/specs/` 无既有 spec，本次仅对其 SKILL.md 做同样的薄引用改动，不为其新建 delta spec（见 Impact）。

## Impact

- **新增**：`skills/runtime-verification-discipline/`（SKILL.md + reference.md）。
- **修改**：4 个 host 的 SKILL.md（solve-workflow、opsx-solve-workflow、jira-fix-workflow、opsx-jira-fix-workflow；必要时含各自 reference.md）；AGENTS.md「Skill 清单」表。
- **复用不改**：`browser-debug-toolkit`、`android-webview-debug` 作为默认验证提供者被新纪律按名弱引用（非 frontmatter 依赖，避免能力依赖传染 host）。
- **正交不变**：`completion-evidence-discipline`（证据新鲜度轴）——两 skill 互相标注边界，一条 pass claim 需两轴都过。
- **出范围**：Electron / iOS 真机驱动能力 skill 的新建（后续迭代）；能力层 recipe（留在各能力 skill）。
- **注意**：`solve-workflow` 无既有 spec，本次只改其 SKILL.md 薄引用、不新建 spec；如需为 solve-workflow 补 spec 可后续单独立项。
- **下游**：`docs/generated/skills-index.md` 由 pre-commit hook 自动重生，纳入提交。
