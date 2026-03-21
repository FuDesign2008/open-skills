# OpenCode 插件架构

OpenCode 平台使用 ES Module 插件替代 Claude Code/Cursor 的 Shell 脚本 Hook。

## 目录结构

```
.opencode/
├── plugins/
│   └── open-skills.js      # 主插件：系统提示注入（欢迎语 + skill 内容）
├── plugin/
│   └── coding-fangirl-hooks.ts  # Hook 插件：里程碑庆祝（commit/push/test/build）
├── package.json             # 依赖：@opencode-ai/plugin
├── INSTALL.md               # 安装指南（符号链接方式）
└── bun.lock                 # 锁文件
```

## 两类插件

### 1. 系统提示插件（`plugins/open-skills.js`）

- 导出：`OpenSkillsPlugin`
- 钩子：`experimental.chat.system.transform`
- 功能：每 session 首次注入欢迎语（10% 概率附带 Star 提示），加载 coding-fangirl SKILL.md 到系统提示
- Skill 路径：`~/.config/opencode/open-skills/skills/coding-fangirl/SKILL.md`

### 2. Hook 插件（`plugin/coding-fangirl-hooks.ts`）

- 导出：`CodingFangirlHooksPlugin`
- 钩子：`tool.execute.after`
- 功能：监听 Bash 工具调用，检测 git commit/push、test、build 命令，随机输出庆祝语录
- 检测模式：正则匹配命令字符串（`/git\s+commit/i` 等）

## API 模式

```javascript
// 系统提示注入
export const PluginName = async ({ client, directory }) => ({
  'experimental.chat.system.transform': async (input, output) => {
    output.system.push('注入内容');  // mutation 模式，直接修改 output
  },
});

// 工具执行后 Hook
export const PluginName: Plugin = async ({ client, $ }) => ({
  tool: {
    execute: {
      after: async (input, output) => {
        if (input.tool !== "bash") return;
        console.log('输出内容');  // console.log 被 OpenCode 捕获显示
      },
    },
  },
});
```

## 安装机制

以下属于 OpenCode **全能力安装**；**通用安装**（仅 `SKILL.md`）见仓库 `docs/INSTALL.md` 的 npx 说明。

符号链接方式安装到 `~/.config/opencode/`：

1. 克隆仓库
2. 创建符号链接：`ln -sf <repo>/.opencode/plugins ~/.config/opencode/plugins`
3. Skills/commands 也需链接：`ln -sf <repo>/skills ~/.config/opencode/open-skills/skills`

详见 `INSTALL.md`。

## 与 Claude Code/Cursor 的差异

| 功能 | Claude Code/Cursor | OpenCode |
|------|-------------------|----------|
| 欢迎语 | Shell 脚本（`hooks/session-start`） | JS 插件（`plugins/open-skills.js`） |
| 里程碑庆祝 | Shell 脚本（`hooks/milestone-celebrate`） | TS 插件（`plugin/coding-fangirl-hooks.ts`） |
| 情绪安抚 | Shell 脚本（`hooks/emotion-comfort`） | 尚未实现（TODO） |
| Skill 加载 | 平台自动发现 SKILL.md | 插件手动读取并注入系统提示 |

## 反模式

- ❌ 使用 CommonJS（`module.exports`）—— 必须 ES Module（`export const`）
- ❌ 在 Hook 中返回值 —— 必须 mutation 模式（修改 `output` 对象）
- ❌ 硬编码绝对路径 —— 使用 `os.homedir()` + 相对路径
- ❌ Hook 抛出异常阻塞流程 —— 必须 try-catch 或静默失败
