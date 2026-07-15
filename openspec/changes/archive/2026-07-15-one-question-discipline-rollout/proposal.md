## Why

「一次一问」硬纪律已在 `opsx-solve-workflow` / `solve-workflow` 落地（change `one-question-discipline`，实测 opsx 无 brainstorming 环境 7→1）。但其余 3 个声明该纪律的 skill 仍是**声明式**（无条件声明但无醒目硬纪律强化、未明确多平台兼容），与试点 skill 不统一：

- `jira-fix-workflow`（1024 行）：有「主动提问」声明（行 130）+ Red Flag（行 339），但无醒目硬纪律小节、未提多平台。
- `opsx-jira-fix-workflow`（647 行）：行 191 单句声明，无 Red Flag、无多平台。
- `think-big`（184 行，英文）：行 111 单句「Ask one question at a time」，无强化、无多平台。

推广到这 3 个 skill，使全工程工作流 skill 统一落地一次一问硬纪律 + 多平台兼容。

## What Changes

- **`jira-fix-workflow`**：「主动提问」小节改醒目硬纪律版（F2，中文）+ 平台无关提问（铁律 6）。
- **`opsx-jira-fix-workflow`**：行 191 提问纪律强化 + 阶段 Red Flags 加「一次列多个歧义点」违规（F3）+ 多平台（铁律 6）。
- **`think-big`**：行 111 改英文版硬纪律强化（铁律 3 英文正文）+ 多平台（铁律 6，英文表述）。
- **delta spec**：扩展 `clarifying-question-discipline` 覆盖范围——所有声明向用户提问的工作流 skill SHALL 落地此纪律。

## Capabilities

### New Capabilities

- 无。

### Modified Capabilities

- `clarifying-question-discipline`：扩展覆盖到所有声明向用户提问的工作流 skill（jira-fix-workflow、opsx-jira-fix-workflow、think-big 等），要求各 skill 落地醒目硬纪律 + Red Flags 违规条 + 平台无关提问方式。

## Impact

- `skills/jira-fix-workflow/SKILL.md`：「主动提问」小节（行 130 区域）+ 多平台。
- `skills/opsx-jira-fix-workflow/SKILL.md`：行 191 提问纪律 + 阶段 Red Flags + 多平台。
- `skills/think-big/SKILL.md`：行 111 提问纪律（英文）+ 多平台。
- 本次为**边际强化**（3 skill 已有无条件声明，无 opsx 条件句那种决定性缺陷），统一标准而非修复缺陷。
- 铁律遵循：走 opsx（铁律 5）；think-big 英文正文（铁律 3）；多平台（铁律 6）。
