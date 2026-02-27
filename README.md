# Open Skills

开放技能库：工作流、性能优化、情绪陪伴等 Claude Code Skills。

## How it works

Open Skills 为你的 AI 编码助手提供经过验证的技能和工作流。当你在编程时：

- **情绪陪伴**：当你需要鼓励时，技术小迷妹会给你彩虹屁和情绪价值
- **问题解决**：系统性的七阶段工作流帮你分析和解决复杂问题
- **性能优化**：专业的性能分析流程，从证据收集到优化实施

## Installation

### Claude Code

```bash
# 克隆到 Claude Code 的 skills 目录
git clone https://github.com/FuDesign2008/open-skills.git ~/.claude/skills/open-skills
```

### Cursor

在 Cursor Agent chat 中，将仓库克隆到本地后，在设置中添加 skills 路径。

### 手动安装

手动复制 `skills/` 目录下的 skill 到你的 skills 目录。

## Skills 列表

### 情绪陪伴

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **coding-fangirl** | 彩虹屁、夸夸我、鼓励一下、迷妹模式、恋爱模式 | 技术小迷妹 AI 编码陪伴 |

### 工作流

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **problem-solving-workflow** | 明确问题、分析问题、评估方案、制定计划、执行计划 | 七阶段问题解决工作流 |
| **perf-workflow** | 性能分析、性能证据、性能定位、性能假设、性能优化 | 性能问题分析与优化工作流 |

### 代码质量

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **chinese-format** | 自动触发 | 中文内容格式规范 |

### 领域知识

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **frontend-perf** | 配合 perf-workflow | 前端性能优化知识库 |
| **android-webview-debug** | android-webview-debug-enable、android-webview-debug-revert | Android WebView 调试统一 |

## Commands

Open Skills 提供以下快捷命令：

- `/encourage` - 彩虹屁和情绪鼓励
- `/solve` - 启动问题解决工作流
- `/perf` - 启动性能分析工作流

## Philosophy

- **情绪价值** - 编程不只是技术，也需要情感支持
- **系统化** - 用流程替代猜测
- **简化** - 简单是首要目标
- **证据驱动** - 在声明成功之前先验证

## Contributing

欢迎贡献新的 skills 或改进现有 skills！

1. Fork 本仓库
2. 创建新的 skill 目录或修改现有 skill
3. 提交 Pull Request

### Skill 结构

```
skills/
└── your-skill/
    ├── SKILL.md          # 必需：Skill 定义
    └── supporting-files  # 可选：支持文件
```

### SKILL.md 格式

```markdown
---
name: your-skill
description: 触发条件和用途说明
---

# Skill 标题

Skill 内容...
```

## License

MIT License - 详见 LICENSE 文件
