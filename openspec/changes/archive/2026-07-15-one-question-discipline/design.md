## Context

本工程 skill（opsx-solve-workflow、solve-workflow）声明了「一次只问一个关键问题」纪律，但 AI 执行时不遵守（实测 opsx 在无 brainstorming 环境一次列 7 个）。对照 `superpowers/brainstorming`——同名纪律运行良好，靠的是**结构化强制**（`<HARD-GATE>` 标签 + Checklist/Task + 高频重复 + 独立 Key Principles + 篇幅短 159 行），而非声明式提及。

本工程根因：① opsx 条件句「若检测到 brainstorming」（无该 skill 时不触发）；② 「疑问点列出」措辞与一次一问冲突；③ 声明式无强制，且 skill 篇幅长（647-1024 行）淹没纪律。

约束：skill 跨平台（Claude Code/Cursor/OpenCode），不硬依赖专属工具；存量中文 skill 保持中文；本次变更本身按铁律 5 走 opsx 沉淀。

## Goals / Non-Goals

**Goals:**
- 「一次一问」从声明式变为结构化强制，真正可执行（实测验证）
- opsx 去掉条件句致命缺陷（无外部 skill 环境也生效）
- 措辞统一（疑问点列出与硬纪律一致）
- 多平台兼容（不硬依赖 Agent 专属工具）
- 沉淀「平台无关」为长期铁律（铁律 6）

**Non-Goals:**
- 不改 jira-fix-workflow / opsx-jira-fix-workflow / think-big（本次试点 2 个核心 skill，手法验证后推广）
- 不重构整个 skill 篇幅（精准强化，不全文堆砌）

## Decisions

**D1. 去条件句 → 无条件硬纪律（F1，决定性修复）**
opsx 行 254「若检测到 brainstorming…一次只问一个」→ 无条件硬纪律。参考 brainstorming 的无条件 Key Principles。
- 实测证据：opsx 无 brainstorming 环境，改前 7 个问题 → 改后 1 个。这是本次改动的决定性价值点。

**D2. 结构化强制（F2/F3）**
solve-workflow「主动提问」小节改醒目硬纪律版（⚠️ 标签 + 禁止项 + 为什么）；两 skill 的阶段 1 Red Flags 加「一次抛多个疑问点」违规条。参考 brainstorming 的高频强化。

**D3. 措辞统一（F4）**
两 skill 步骤 3「疑问点列出」追加「若向用户提问，一次只问 1 个最关键的」。

**D4. 平台无关（多平台兼容）**
提问以 prose「单问题+多选项」为主，`AskUserQuestion` 仅作 Claude Code 可选工具化，Cursor/OpenCode 用 prose 兜底。初版曾把 AskUserQuestion 当首选（Claude Code 中心主义），已修正。

**D5. 范围试点（opsx + solve-workflow）**
两个核心 skill 验证手法，成功后再推广到其余 skill。solve-workflow 的改动经实测为边际强化（baseline 本就无条件生效），但措辞统一 + 更鲁棒，保留有价值。

**D6. 沉淀铁律 6（平台无关）**
把「skill 正文不得硬依赖某一 Agent 专属工具」固化为 AGENTS.md 铁律 6 + 反模式，避免以后再犯（本次教训的长期沉淀）。

## Risks / Trade-offs

- **[篇幅膨胀]** → 精准强化（仅阶段入口 + 通用原则 + Red Flags），两 skill 各 +6~12 行，实测确认未失控。
- **[仅试点 2 skill]** → 其余 skill 仍可能是声明式（未推广）。Trade-off：先验证手法，推广作后续；本次 Non-Goal。
- **[solve-workflow 改动边际]** → 实测其 baseline 已生效。Trade-off：措辞统一 + 对更弱模型/赶进度场景更鲁棒，保留。

## Migration Plan

- 变更已实现（PR #212，4 commits），纯文本改动，git 可回滚。
- AGENTS.md 铁律 6 不触发 release CI（非 hooks/skills/commands 路径）。
- 归档：delta spec 同步到主 specs/clarifying-question-discipline/，change 迁移到 archive/。

## Open Questions

- 主要决策已定；变更已实现 + 实测通过，无悬而未决问题。
- 后续推广（jira-fix 等）套用同款手法，作下一个 change。
