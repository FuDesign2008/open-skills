# Open Skills 详细安装指南

本页是仓库 **[README — 安装](../README.md#install-path)** 的展开说明：可复制命令、npx 参数与能力边界、装完如何自测、常见问题。OpenCode **全能力**（符号链接、插件）的逐步操作只在 **[.opencode/INSTALL.md](../.opencode/INSTALL.md)**。

**Skill 清单**（名称、版本、触发条件）见 [skills-index.md](generated/skills-index.md)。

---

## 两种安装方式

| 类型 | 你会得到什么 |
|------|----------------|
| **通用安装** | 仅 **SKILL.md**（**npx skills**）。不含 Hooks、Commands、OpenCode 插件 |
| **全能力安装** | Hooks、Commands（如 `/solve`）、各平台原生集成。Claude / Cursor 走 **插件**；OpenCode 走 **raw + [.opencode/INSTALL.md](../.opencode/INSTALL.md)** |

**怎么选**：

- 只要技能文档、且客户端在 [支持的 Agent 列表](https://github.com/vercel-labs/skills#available-agents) 里 → **通用安装**。
- 要快捷命令与 Hook → **全能力安装**。

---

<a id="通用安装-npx-详解"></a>

## 通用安装详解（npx skills）

**通用安装**只下发 `SKILL.md`；同一套命令适用于支持 **npx skills** 的编码助手。

### 安装与列表

```bash
# 全部 skill，全局（推荐）
npx skills add FuDesign2008/open-skills -g

# 仅安装某个 skill
npx skills add FuDesign2008/open-skills --skill solve-workflow -g

# 查看本仓库可安装的 skill 列表
npx skills add FuDesign2008/open-skills --list
```

### 更新

```bash
npx skills update
```

### 能力边界

| 能力 | 是否包含 |
|------|----------|
| `SKILL.md` | 是。默认可全量；可用 `--skill` 按需安装 |
| 名称与触发说明 | 见 [skills-index.md](generated/skills-index.md) |
| Hooks | 否 |
| Commands（`/solve`、`/perf` 等） | 否 |
| OpenCode 插件 | 否 |

---

<a id="全能力安装说明"></a>

## 全能力安装与更新

以下均为 **全能力** 路径（含 Hooks、Commands 与各端集成）。更新后请 **完全退出并重启** 对应客户端，再验证行为。

### Claude Code

**安装**：在会话中执行：

```
/plugin install open-skills@open-skills-marketplace
```

**更新**：在系统终端执行：

```bash
claude plugin update open-skills@open-skills-marketplace
```

然后完全退出并重启 Claude Code。

### Cursor

**安装**：在会话中执行：

```
/plugin-add open-skills
```

**更新**：在 Cursor 的插件或 Marketplace 界面为 **open-skills** 检查并安装更新；若当前版本支持通过会话重复覆盖安装，可再次执行 `/plugin-add open-skills`。完成后建议完全重启 Cursor。

### OpenCode

**安装**：在 OpenCode 对话中发送下面整段（或按产品说明粘贴），再严格按 [.opencode/INSTALL.md](../.opencode/INSTALL.md) 完成符号链接与插件配置：

```
Fetch and follow instructions from https://raw.githubusercontent.com/FuDesign2008/open-skills/main/.opencode/INSTALL.md
```

**更新**：在本机 clone 目录拉取最新代码，并重新链接 `commands`（与 [.opencode/INSTALL.md](../.opencode/INSTALL.md) 的 **更新** 节一致）：

```bash
cd ~/.config/opencode/open-skills
git pull

# 重新链接 commands（如有新增或路径变化）
for cmd in ~/.config/opencode/open-skills/commands/*.md; do
  ln -sf "$cmd" ~/.config/opencode/commands/
done
```

若 `git pull` 后安装文档要求调整 `~/.config/opencode/plugins/` 下的符号链接，按 [.opencode/INSTALL.md](../.opencode/INSTALL.md) 安装步骤补做。

与 Claude / Cursor 的 Shell Hook 差异见 [.opencode/AGENTS.md](../.opencode/AGENTS.md)。

### 装好后常见目录

| 平台 | 常见路径（插件或 clone 落点） |
|------|------------------------------|
| Claude Code | `~/.claude/skills/open-skills` |
| Cursor | `~/.cursor/extensions/open-skills` |
| OpenCode | `~/.config/opencode/open-skills` |

---

<a id="装完自测"></a>

## 装完自测

1. 新开一轮对话（或重启客户端）。
2. 试发 **「彩虹屁」** 或 **「分析问题」**。
3. 若无响应，打开 [常见问题](#常见问题)。

---

<a id="常见问题"></a>
<a id="troubleshooting"></a>

## 常见问题

### Skill 未加载

1. **确认落盘位置**：对照 [全能力安装与更新 — 装好后常见目录](#全能力安装说明)。若为 **通用安装**，以本机 `npx skills` 实际目录为准（若曾改配置，以你本机为准）。
2. **确认文件齐全**：进入对应目录下的 `skills/`，每个 skill 为独立文件夹且内含 `SKILL.md`；名称可与 [skills-index.md](generated/skills-index.md) 对照。
3. **完全重启客户端**：退出整个应用再打开，不要只关单个窗口。

### 触发词不生效

1. 打开 [skills-index.md](generated/skills-index.md)，查看该 Skill 描述中的触发条件。
2. 先试 **只发触发词**；不行再试 **「触发词：你的具体情况」**（冒号中英文均可）。
3. 若多个 Skill 触发词相近，可能被其他规则优先匹配，可改用更明确的 **「触发词：…」** 说法。

### 更新后仍是旧行为

- **全能力**：先按上文 [全能力安装与更新 — 各平台「更新」](#全能力安装说明) 做完，并**完全重启**客户端。
- **仍异常**：可重装对应平台的 **安装** 步骤，或改用 **通用安装（npx）** 仅同步 SKILL.md；OpenCode 对照 [.opencode/INSTALL.md](../.opencode/INSTALL.md) 检查链接与路径。
