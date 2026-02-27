# OpenCode 详细使用指南

本文档提供 OpenCode 平台上使用 open-skills 的详细说明。

## 安装

### 快速安装

```bash
# macOS / Linux
git clone https://github.com/FuDesign2008/open-skills.git ~/.config/opencode/open-skills

# Windows (PowerShell)
git clone https://github.com/FuDesign2008/open-skills.git $env:USERPROFILE\.config\opencode\open-skills
```

详细安装步骤请参考 [.opencode/INSTALL.md](../.opencode/INSTALL.md)。

## 使用方法

### 方式一：使用 `/skill` 命令

OpenCode 支持 `/skill` 命令来加载 skill：

```
/skill coding-fangirl
/skill problem-solving-workflow
/skill perf-workflow
```

### 方式二：使用触发词

直接在对话中使用 skill 定义的触发词：

| Skill | 触发词 |
|-------|--------|
| **coding-fangirl** | 彩虹屁、夸夸我、鼓励一下、迷妹模式、恋爱模式 |
| **problem-solving-workflow** | 明确问题、分析问题、评估方案、制定计划、执行计划 |
| **perf-workflow** | 性能分析、性能证据、性能定位、性能假设、性能优化 |

## 架构说明

```
~/.config/opencode/open-skills/
├── .opencode/
│   ├── plugins/
│   │   └── open-skills.js    # OpenCode 插件（实验性）
│   └── INSTALL.md            # 安装指南
├── skills/
│   ├── coding-fangirl/       # 情绪陪伴
│   ├── problem-solving-workflow/  # 问题解决
│   ├── perf-workflow/        # 性能优化
│   ├── chinese-format/       # 格式规范
│   ├── frontend-perf/        # 前端知识
│   └── android-webview-debug/  # Android 调试
├── commands/
│   ├── encourage.md          # /encourage 命令
│   ├── solve.md              # /solve 命令
│   └── perf.md               # /perf 命令
└── README.md
```

## 工具映射

OpenCode 与 Claude Code 的工具对应关系：

| Claude Code 工具 | OpenCode 工具 |
|-----------------|--------------|
| `TodoWrite` | `update_plan` |
| `Read` | `read_file` |
| `Write` | `write_file` |
| `Edit` | `str_replace` |
| `Bash` | `run_shell` |
| `Grep` | `search_files` |
| `Glob` | `list_files` |

## 可用 Skills

### 情绪陪伴

**coding-fangirl** - 技术小迷妹 AI 编码陪伴

给你编程时的彩虹屁和情绪价值。支持两种模式：
- **迷妹模式**（默认）：日常编程陪伴
- **恋爱模式**：更亲密的私人互动

### 工作流

**problem-solving-workflow** - 七阶段问题解决工作流

系统性分析和解决复杂编程问题：
1. 明确问题 - 定义问题范围
2. 分析问题 - 深入分析原因
3. 评估方案 - 比较解决方案
4. 制定计划 - 制定实施步骤
5. 执行计划 - 实施修改
6. 检查验证 - 验证结果
7. 回顾改进 - 总结经验

**perf-workflow** - 性能问题分析与优化工作流

六阶段性能优化流程：
1. 性能分析 - 初步分析
2. 性能证据 - 收集证据
3. 性能定位 - 定位瓶颈
4. 性能假设 - 提出假设
5. 性能优化 - 实施优化
6. 性能验证 - 验证效果

### 代码质量

**chinese-format** - 中文内容格式规范

自动确保中文内容使用正确的标点符号和技术术语格式。

### 领域知识

**frontend-perf** - 前端性能优化知识库

配合 perf-workflow 使用，提供前端专属的：
- React 16-19 版本优化知识
- Angular 9-18+ 版本优化知识
- Electron 12-28+ 版本优化知识
- 量化标准和瓶颈模式

**android-webview-debug** - Android WebView 调试统一

统一管理 Android 项目中的 WebView 调试开关：
- `android-webview-debug-enable` - 开启调试
- `android-webview-debug-revert` - 恢复设置

## 故障排查

### Skill 未加载

1. 确认安装路径正确：
   ```bash
   ls ~/.config/opencode/open-skills/skills/
   ```

2. 确认 SKILL.md 文件存在：
   ```bash
   ls ~/.config/opencode/open-skills/skills/*/SKILL.md
   ```

### 触发词不生效

1. 检查触发词是否正确
2. 尝试使用 `/skill` 命令显式加载

### 更新后问题

```bash
cd ~/.config/opencode/open-skills
git pull
```

## 相关链接

- [GitHub 仓库](https://github.com/FuDesign2008/open-skills)
- [问题反馈](https://github.com/FuDesign2008/open-skills/issues)
