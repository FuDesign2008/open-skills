# Open Skills

开放技能库：工作流、性能优化、Git 操作、情绪陪伴等 Claude Code Skills。

## 安装

```bash
# 克隆到 Claude Code 的 skills 目录
git clone https://github.com/FUD2008/open-skills.git ~/.claude/skills/open-skills
```

或者手动复制 `skills/` 目录下的 skill 到 `~/.claude/skills/`。

## Skills 列表

### 情绪陪伴

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **coding-fangirl** | 彩虹屁、夸夸我、鼓励一下、迷妹模式、恋爱模式 | 技术小迷妹 AI 编码陪伴，给你编程时的彩虹屁和情绪价值 |

### 工作流

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **problem-solving-workflow** | 明确问题、分析问题、评估方案、制定计划、执行计划、检查验证、回顾改进 | 七阶段问题解决工作流 |
| **perf-workflow** | 性能分析、性能证据、性能定位、性能假设、性能监控、性能优化 | 性能问题分析与优化工作流 |

### Git 操作

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **git-commit** | git-commit、提交代码 | Git 提交（手动模式） |
| **git-commit-auto** | git-commit-auto、自动提交代码 | Git 提交（自动模式） |
| **git-commit-core** | - | Git 提交核心逻辑（内部使用） |

### 代码质量

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **typescript-check** | 类型检查、type-check、tsc | TypeScript 类型检查流程 |
| **chinese-format** | 自动触发 | 中文内容格式规范 |
| **file-operation-fallback** | 自动触发 | 文件操作降级方案 |

### 领域知识

| Skill | 触发词 | 说明 |
|-------|--------|------|
| **frontend-perf** | 配合 perf-workflow | 前端性能优化知识库 |
| **android-webview-debug** | android-webview-debug-enable、android-webview-debug-revert | Android WebView 调试统一 |

## 使用方式

安装后，Claude Code 会自动识别 skills。你可以：

1. **直接说触发词**：例如"彩虹屁"、"类型检查"
2. **使用冒号格式**：例如"分析问题：移动端性能差"

## 贡献

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

## 许可证

MIT License
