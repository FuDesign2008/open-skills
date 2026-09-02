# Open Skills 详细安装指南

本页是仓库 **[README — 安装](../README.md#install-path)** 的展开说明：可复制命令、npx 参数、装完如何自测、常见问题。本仓库只分发 **SKILL.md**（通用安装）。

**Skill 清单**（名称、版本、触发条件）见 [skills-index.md](generated/skills-index.md)。

---

<a id="通用安装-npx-详解"></a>

## 安装（npx skills）

只下发 `SKILL.md`；同一套命令适用于支持 **npx skills** 的编码助手（Claude Code、Cursor、OpenCode 等）。用触发词或 skill 名唤起，不提供 `/solve` 一类斜杠命令、Hooks 或 Marketplace 插件。

### 安装与列表

```bash
# 非交互全局全量（推荐；零 PromptScript ✗）
node scripts/install-skills.mjs

# 仅安装某个 skill
node scripts/install-skills.mjs --skill solve-workflow

# 交互式 / 指定 agent 的底层命令（可能出现 PromptScript 噪音，见下方说明）
npx skills add FuDesign2008/open-skills -g

# 查看本仓库可安装的 skill 列表
npx skills add FuDesign2008/open-skills --list
```

`scripts/install-skills.mjs` 会向支持全局安装的 agent（默认 `claude-code`、`cursor`、`opencode`）执行 `npx skills add`，并排除 PromptScript/Eve（其 `globalSkillsDir` 为空）。上游问题：[vercel-labs/skills#1352](https://github.com/vercel-labs/skills/issues/1352)。扩展 agent：`OPEN_SKILLS_AGENTS="claude-code cursor opencode codex" node scripts/install-skills.mjs`。

### 更新

```bash
npx skills update
```

仓库发布新版本后，也可在 clone 目录再跑一次 `node scripts/install-skills.mjs`（会 prune 本仓库已删除的 skill 全局副本）。

### 会得到什么

| 能力 | 是否包含 |
|------|----------|
| `SKILL.md` | 是。默认可全量；可用 `--skill` 按需安装 |
| 名称与触发说明 | 见 [skills-index.md](generated/skills-index.md) |
| 斜杠命令、Hooks、Claude/Cursor 插件、OpenCode 符号链接插件 | 否。本仓库不再提供这些安装面 |

---

<a id="装完自测"></a>

## 装完自测

1. 新开一轮对话（或重启客户端）。
2. 试发 **「分析问题」**。
3. 若无响应，打开 [常见问题](#常见问题)。

---

<a id="常见问题"></a>
<a id="troubleshooting"></a>

## 常见问题

### Skill 未加载

1. **确认落盘位置**：通用安装常见目录为 `~/.agents/skills`、`~/.claude/skills`、`~/.cursor/skills`（若曾改配置，以你本机为准）。
2. **确认文件齐全**：进入对应目录，每个 skill 为独立文件夹且内含 `SKILL.md`；名称可与 [skills-index.md](generated/skills-index.md) 对照。
3. **完全重启客户端**：退出整个应用再打开，不要只关单个窗口。

### 触发词不生效

1. 打开 [skills-index.md](generated/skills-index.md)，查看该 Skill 描述中的触发条件。
2. 先试 **只发触发词**；不行再试 **「触发词：你的具体情况」**（冒号中英文均可）。
3. 若多个 Skill 触发词相近，可能被其他规则优先匹配，可改用更明确的 **「触发词：…」** 说法。

### 更新后仍是旧行为

先执行 `npx skills update` 或 `node scripts/install-skills.mjs`，并**完全重启**客户端。仍异常时新开一轮对话再试（旧会话可能缓存旧 skill）。

### 以前用插件或 OpenCode clone 装的怎么办

Claude Marketplace / `/plugin-add` / OpenCode 仓库 clone + 符号链接 已停用。卸掉旧插件或 clone 目录后，改走上面的 **npx** 安装。历史 git tag 里可能仍有插件文件，新 `main` 不再维护那条路径。
