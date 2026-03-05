# Skills 开发规范

每个 skill = 一个子目录 + `SKILL.md` 文件。

## 目录结构

```
skills/
├── coding-fangirl/         # 情绪陪伴（v5.2.0）- 含 context.json 供 Hook 使用
│   ├── SKILL.md
│   └── context.json        # SessionStart Hook 加载的上下文数据
├── solve-workflow/          # 七阶段问题解决（v1.1.0）
├── perf-workflow/           # 六阶段性能分析（v2.1.0）
├── frontend-perf/           # 前端性能知识库（v2.0.0）- 含 reference.md
│   ├── SKILL.md
│   └── reference.md        # 补充参考资料（React/Angular/Electron 版本专属优化）
├── chinese-format/          # 中文格式规范（v1.1.0）
└── android-webview-debug/   # WebView 调试开关
```

## 分类与依赖

| 类别 | Skills | 说明 |
|------|--------|------|
| 情绪陪伴 | coding-fangirl | 核心 skill，被三个 Hook 引用，有专属 context.json |
| 工作流 | solve-workflow, perf-workflow | 多阶段流程，有严格阶段边界 |
| 知识库 | frontend-perf | **依赖 perf-workflow**，为其提供前端领域专属数据 |
| 格式规范 | chinese-format | 自动触发，无需用户主动调用 |
| 工具 | android-webview-debug | enable/revert 双模式，带修改记录和回滚 |

## SKILL.md 必须包含

```yaml
---
name: kebab-case-name       # 必须与目录名一致
version: "X.Y.Z"            # 语义化版本
user-invocable: true|false   # false 表示仅被其他 skill 调用
description: |               # 必须包含所有触发词
  触发条件说明。当用户说"触发词1"、"触发词2"时触发。
---
```

## 触发词规则

- 在 `description` 中列出所有触发词
- 支持两种形式："触发词" 或 "触发词：具体描述"
- 冒号中英文均可，空格可有可无
- 工作流 skill 的阶段名即为触发词（如"分析问题"触发 solve-workflow 的阶段 2）

## 新增 Skill 检查清单

1. 目录名 kebab-case
2. `SKILL.md` frontmatter 完整（name、version、description 含触发词）
3. 如需命令入口 → 在 `commands/` 添加对应 `.md`
4. 如需 Hook 触发 → 在 `hooks/hooks.json` 添加配置
5. 如需 OpenCode 支持 → 在 `.opencode/plugins/` 或 `.opencode/plugin/` 添加 JS/TS 代码

## 反模式

- ❌ SKILL.md 缺少 frontmatter 或 description 不含触发词
- ❌ `user-invocable: false` 但无其他 skill 引用它
- ❌ 目录名与 frontmatter `name` 不一致
- ❌ 工作流 skill 跳过阶段（分析阶段禁止 Edit/Write）
- ❌ 支持文件（如 reference.md）未在 SKILL.md 中引用
