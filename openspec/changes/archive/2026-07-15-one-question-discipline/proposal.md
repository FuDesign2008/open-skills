## Why

本工程 skill（`opsx-solve-workflow`、`solve-workflow` 等）声明了「一次只问一个关键问题」纪律，但 AI 执行时不遵守。根因有三：

1. **条件句致命缺陷**：`opsx-solve-workflow` 阶段 1.1 把该纪律写成条件句「**若检测到 brainstorming** 且需求模糊…一次只问一个」——在没有 brainstorming skill 的环境（常见，因 brainstorming 是 superpowers 外部 skill）下**完全不触发**。实测对照：subagent 在无 brainstorming 环境跑阶段 1.1，改前一次列 **7 个**问题。
2. **措辞冲突**：阶段 1.1 步骤 3「疑问点列出」无数量约束，与「一次一问」自相矛盾（AI 据此列多个）。
3. **声明式而非强制式**：纪律散在普通段落，无醒目标签/硬纪律语气，靠 AI 自觉——而 `superpowers/brainstorming` 的同名纪律运行良好，靠的是结构化强制（醒目标签 + 硬纪律 + 高频重复 + 工具化）。

## What Changes

参考 `superpowers/brainstorming` 的结构化强制手法，让「一次一问」从声明式变为真正可执行：

- **`opsx-solve-workflow`**：去掉阶段 1.1 条件句（F1），改为**无条件硬纪律**；步骤 3「疑问点列出」追加「一次只问 1 个最关键的」（F4）；Red Flags 加违规条（F3）。
- **`solve-workflow`**：「主动提问」小节改为醒目硬纪律版（⚠️ 标签 + 禁止项 + 为什么 + 工具化建议，F2/F3/F5）；步骤 3 措辞统一；Red Flags 加违规条。
- **多平台兼容**：提问以平台无关的 prose「单问题 + 多选项」格式为主，`AskUserQuestion` 仅作 Claude Code 上的可选工具化（Cursor/OpenCode 无此工具时用 prose）——不硬依赖某一 Agent 专属工具。
- **`AGENTS.md`**：新增铁律 6（skill 正文不得硬依赖某一 Agent 专属工具，平台无关）+ 对应反模式。

## Capabilities

### New Capabilities

- `clarifying-question-discipline`：当信息不足需向用户提问时，AI 每次只问一个最关键的问题（无条件硬纪律，不依赖外部 skill 是否存在），且提问方式平台无关（prose 为主，Agent 专属工具仅作可选增强）。

### Modified Capabilities

- 无。本仓库 `openspec/specs/` 此前未定义该能力，本次为首次定义。

## Impact

- `skills/opsx-solve-workflow/SKILL.md`：阶段 1.1 行 254（去条件句）、步骤 3 行 260（措辞）、Red Flags（加违规）。
- `skills/solve-workflow/SKILL.md`：「主动提问」小节行 125-127（强化）、步骤 3 行 218（措辞）、Red Flags（加违规）。
- `AGENTS.md`：铁律 6 + 反模式（平台无关）。
- **实测对照**（subagent 跑阶段 1.1）：opsx 无 brainstorming 环境，改前 7 个问题 → 改后 1 个（F1 去条件句为决定性修复）；solve-workflow 改前改后均 1 个（baseline 本就无条件生效，改动为边际强化）。
- 铁律遵循：本次变更本身按铁律 5 走 opsx 沉淀；skill 正文中文（存量中文 skill 一致）、触发词含中文、多平台兼容（铁律 6）。
