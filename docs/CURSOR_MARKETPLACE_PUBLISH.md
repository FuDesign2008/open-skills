# Cursor Marketplace 上架提交包（open-skills）

本文档用于快速完成 `open-skills` 在 Cursor Marketplace 的提交与验收。

## 1) 提交前信息（可直接复制）

- 插件名称（slug）：`open-skills`
- 显示名称：`Open Skills`
- 仓库地址：`https://github.com/FuDesign2008/open-skills`
- 插件清单：`.cursor-plugin/plugin.json`
- 核心能力：Skills、Commands、Hooks

### 建议短描述（80-120 字）

Open Skills 是一个面向 AI 编码助手的技能库，提供系统化问题解决工作流、性能优化流程和情绪陪伴能力，支持通过触发词与命令快速调用，帮助开发者在日常编码中更稳定地分析问题、执行方案并完成验证。

### 建议关键词

`skills, workflow, productivity, performance, companion, ai-assistant`

### 建议发布说明（What this plugin provides）

1. 七阶段问题解决工作流（从“明确问题”到“回顾改进”）  
2. 性能分析到优化验证的闭环流程  
3. 触发词 + `/solve`、`/perf`、`/encourage` 命令快捷调用  
4. 多平台适配（Claude Code / Cursor / OpenCode）的一致技能组织结构

## 2) 你需要完成的上架动作

1. 打开 Cursor Marketplace 发布入口并提交仓库信息
2. 填写插件元数据（名称、描述、关键词、仓库地址）
3. 提交审核并等待结果
4. 审核反馈若要求补充材料，按反馈补充后重新提交

## 3) 上架后验收（你来执行）

1. 在 Cursor 新会话中安装插件（已上架后）：

```bash
/plugin-add open-skills
```

2. 触发验证：
   - 输入：`分析问题：xxx`
   - 期望：自动命中 `solve-workflow` 相关行为
3. 命令验证：
   - `/solve`
   - `/perf`
   - `/encourage`
4. 如果安装命令不可用或未检索到：
   - 按 `docs/INSTALL.md` 的 Cursor 手动安装路径完成安装

## 4) README 对外口径（已同步）

`README.md` 已区分两条路径：

- 已上架：`/plugin-add open-skills`
- 未上架/未检索到：走 `docs/INSTALL.md` 手动安装

这样可以避免用户误以为“未上架状态也能按 slug 直接安装”。
