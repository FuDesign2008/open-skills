# Design: fix-jira-comment-fidelity

## Jira Context

- **模拟票据**: PROJ-123（占位，脱敏）。真实场景：Agent 按既有 SOP 发送保真 Wiki 评论两次均被 MCP 工具层转义破坏，REST 直写才成功。
- **数据源**: 一手实证（本仓 skill 使用者的回写故障），非转述。

## Root Cause

`jira-status-writeback` SOP 步骤 2 把「工具调用 HTTP 2xx = 评论保真」当作默认假设：既不要求写入后回读验证标记保真，也不提供失真回退通道。任何会转写 body 的中间层（转义 `*`/`_`、改写标题、Markdown↔Wiki 互转）都会静默破坏渲染，HTTP 2xx 掩盖失败——调用者无从发现。

## Options

| 方案 | 思路 | 结论 |
|---|---|---|
| A | SOP 增加「中间层可能转义」的警告文字 | ❌ 仅提示不闭环，无判定标准与回退动作 |
| B | 写入后回读 body 比对关键 Wiki 标记；失真时用配套脚本直连 REST 重写（凭证链同 `jira-read`） | ✅ 判定输入可核验（铁律 10）、动作闭环、平台无关（铁律 6） |
| C | 全面废弃 MCP 通道，SOP 一律走脚本 | ❌ 保真的部署无谓降级；MCP 状态流转步骤实证可用 |

## 方案 B 实现要点

1. **SOP 步骤 2 重写**（`jira-status-writeback/SKILL.md`）：用既有工具（MCP）发送 → 从工具响应（或 GET 回读）取回存储的 `body` → 比对关键标记（`h3.`/`h4.` 行首、`*bold*`、`{{mono}}`、`[label|url]`）→ 全部保真即完成；任一失真（如 `\*` 转义、标题变 `###`）→ 用 `scripts/update-comment-wiki.mjs` 直连 REST 新建/更新该评论。
2. **脚本**（`skills/jira-status-writeback/scripts/update-comment-wiki.mjs`）：自包含凭证链（env `JIRA_PERSONAL_TOKEN` / `JIRA_PAT` → `~/.config/jira-certs/jira-pat.txt` 首行，逻辑同 `jira-read`）；站点 base URL 取 env `JIRA_URL`；wiki 正文经 `--file <path>` 或 stdin 传入；mTLS 可选（client.crt/client.key 存在时启用）；内建回读保真校验并输出 PASS/FAIL 明细；纯函数 `checkFidelity` 导出供测试。
3. **测试**（`scripts/update-comment-wiki.test.mjs`，node:test）：`checkFidelity` 覆盖保真 / 转义失真 / 标题改写三态。
4. **jira-wiki-markup**：Composition 节后加一段交叉指引（任何 wiki 字段写入后回读验证；失真回退见 `jira-status-writeback` 的脚本与 SOP），不重复规则。

## Risk

- 脚本依赖站点可达与证书；REST 通道失败时按既有 SOP「warn 不阻断」处理（merge 已完成）。
- 回读校验依赖工具响应含 body（多数客户端返回已存 body）；无 body 时降级为 GET 回读或按失败处理。
- 脚本不处理 Cloud/ADF（`jira-wiki-markup` 边界本就排除 Cloud）。

## Verification Notes

- `node --test skills/jira-status-writeback/scripts/` 全绿；`node --check` 语法通过。
- `npm run lint:deid -- --staged` 通过（脱敏门禁）。
- `node scripts/gen-skill-docs.mjs` 后 index 无 diff（或由 pre-commit 自动处理）。
- `openspec validate fix-jira-comment-fidelity` 通过。
- 行为实证：在真实站点重放一次评论写入，确认保真 PASS 路径可走通（失真回退路径由单测覆盖）。
