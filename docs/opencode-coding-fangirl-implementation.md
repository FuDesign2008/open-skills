# OpenCode Coding Fangirl 自动触发功能实现文档

## 概述

本文档记录 coding-fangirl 在 OpenCode 中的自动触发功能实现状态。

**更新日期**：2026-03-01

---

## 功能状态

| 功能 | 实现位置 | 状态 | 说明 |
|------|----------|------|------|
| **Session 欢迎语** | `open-skills.js` | ✅ 已验证 | 通过 `system.transform` 注入系统提示，AI “知道”欢迎语但用户不会直接看到 |
| **Skill 内容注入** | `open-skills.js` | ✅ 已验证 | 加载 SKILL.md 内容到系统提示 |
| **里程碑庆祝** | `coding-fangirl-hooks.ts` | ✅ 已验证 | 通过 `tool.execute.after` 监听 bash 工具，检测 git commit/push/build/test |
| **情绪感知** | 已删除 | ❌ 不可用 | `system.transform` 的 `input` 不包含用户消息（无 `input.parts`），无法检测情绪 |
| **时间关怀** | 已删除 | ❌ 不可用 | 依赖 `session.idle` 事件，OpenCode 未确认支持该事件 |
| **AI 协作完成** | 已删除 | ❌ 不可用 | 同上，依赖 `session.idle` 事件 |

### Claude Code vs OpenCode 对比

| 功能 | Claude Code | OpenCode |
|------|-------------|----------|
| 里程碑庆祝 | ✅ hooks.json + Shell 脚本 | ✅ `tool.execute.after` hook |
| 情绪感知 | ✅ UserPromptSubmit hook | ❌ API 不支持读取用户消息 |
| 时间关怀 | ✅ SessionStart hook | ❌ 无 `session.idle` 事件 |
| AI 协作完成 | ✅ PostToolUse hook | ❌ 无 `session.idle` 事件 |
| Session 欢迎语 | ✅ 用户可见（systemMessage） | ⚠️ 系统提示注入（AI 可见，用户不直接可见） |

---

## 文件结构

```
.opencode/
├── plugin/
│   └── coding-fangirl-hooks.ts  # 里程碑庆祝（tool.execute.after）
├── plugins/
│   └── open-skills.js           # 欢迎语 + skill 内容注入
└── INSTALL.md               # 安装指南（含两个插件的符号链接）
```

---

## 技术说明

### OpenCode 插件 API 限制

1. **`experimental.chat.system.transform`** 的 `input` 参数只包含 `{ sessionID?: string, model: Model }`，不包含用户消息内容。因此无法在此 hook 中实现情绪检测。

2. **OpenCode 确认支持的事件**：`session.created`、`session.compacted`、`session.deleted`。不支持 `session.idle`，因此时间关怀和 AI 协作完成功能无法实现。

3. **`tool.execute.after`** 是已验证的 hook，可以监听工具执行后的事件。里程碑庆祝功能基于此 hook 实现。

### 安装流程

INSTALL.md 中需要为两个插件文件创建符号链接：
- `open-skills.js` → `~/.config/opencode/plugins/open-skills.js`
- `coding-fangirl-hooks.ts` → `~/.config/opencode/plugins/coding-fangirl-hooks.ts`

---

## 已删除代码说明

### 从 `open-skills.js` 删除

- `COMFORT_MESSAGES` 语录库
- `NEGATIVE_EMOTION_WORDS` 负面情绪词列表
- `detectNegativeEmotion()` 函数
- `input.parts` 情绪检测代码块

原因：`input.parts` 在 `system.transform` API 中不存在，该代码永远不会执行。

### 从 `coding-fangirl-hooks.ts` 删除

- `NIGHT_CARE_MESSAGES` 语录库
- `AI_COLLABORATION_MESSAGES` 语录库
- `isNightTime()` 函数
- `event` handler（`session.idle` 事件监听）

原因：OpenCode 不支持 `session.idle` 事件，该代码永远不会触发。

---

## 参考资料

- `.opencode/plugin/coding-fangirl-hooks.ts` — 里程碑庆祝插件
- `.opencode/plugins/open-skills.js` — 系统提示注入插件
- `hooks/milestone-celebrate` — Claude Code hooks 脚本（参考）
- `skills/coding-fangirl/SKILL.md` — coding-fangirl skill 定义