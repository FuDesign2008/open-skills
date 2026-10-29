## Why

上一轮归档 `fix-jira-comment-fidelity` 时暴露两个契约缺口：

1. `jira-status-writeback` 的 REST 回退脚本 import 了 `jira-read` 的凭证解析器，但 skill 的 frontmatter 只声明 `jira-wiki-markup`。按 `--skill jira-status-writeback` 单装时，回退路径会以 `ERR_MODULE_NOT_FOUND` 崩溃，而契约却承诺它可用。
2. `jira-wiki-markup` 新增了「写入后回读、失真则回退」的规范性指令，但该行为没有对应的 spec 需求，归档记录为「无契约变更」。

## What Changes

- `jira-status-writeback` 声明 `jira-read` 为强依赖，前置检查两者；澄清「本 skill 不解析 PAT 文件」指的是 SOP，而打包的回退脚本通过 `jira-read` 的解析器取凭证；加载中止按写回失败告警处理，不回滚已完成合并。
- `jira-wiki-markup` 新增「写入通道的标记保真」需求：写入任何 Wiki 渲染字段后回读关键标记，无法回读即视为未验证；失真时使用可用的直接 REST 回退，并定义可核验的可用性（脚本与凭证解析器文件都存在），明确 bundled 脚本只覆盖 comment body；没有回退通道时如实报告限制而不是宣称成功。
- `jira-fix-workflow` 的 frontmatter 补 `jira-read`，与其 spec 和 `AGENTS.md` 既有声明对齐。
- 四个 skill 版本递增：`jira-status-writeback`、`jira-wiki-markup`、`jira-fix-workflow` 按契约或启动检查变化升 MINOR；`report-output-discipline` 因注册表锚点修正升 PATCH。

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `jira-status-writeback`: 新增运行时依赖声明要求（`jira-wiki-markup` + `jira-read`），缺失即中止。
- `jira-wiki-markup`: 新增写入通道标记保真要求及回退/限制报告规则。

## Impact

- **Skill**：`skills/jira-status-writeback/SKILL.md`、`skills/jira-wiki-markup/SKILL.md`、`skills/jira-fix-workflow/SKILL.md`
- **文档**：`AGENTS.md` 的 Skill 清单依赖列（`jira-status-writeback` 增加 `jira-read`）；`docs/generated/skills-index.md` 版本列随生成更新
- **测试**：新增 `scripts/jira-writeback-dependency.test.mjs`，永久断言声明与脚本 import 目标一致
- **不涉及**：回退脚本的实现与凭证解析逻辑（端点、顺序、比对算法均不变）；`opsx-jira-fix-workflow` 不新增 `jira-read` 硬依赖（其 spec 允许 MCP-only）
