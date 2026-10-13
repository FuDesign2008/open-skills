# Proposal: fix-jira-comment-fidelity

## Why

一次真实的 Jira 修复回写中，Agent 按 `jira-status-writeback` SOP 用 MCP 工具 `jira_add_comment` 发送了正确组合的 Wiki markup，但该工具层对 body 中的标记字符做了转义（`*bold*` 存成 `\*bold\*`、标题被改写），评论渲染完全错乱；Agent 两次发送（Wiki、Markdown 各一次）均被破坏，最终靠绕过 MCP 直接 REST PUT + mTLS 才写入保真 Wiki。SOP 与 `jira-wiki-markup` 均未要求"写入后回读验证标记保真"，也没有失真回退路径——这是可复发的系统性缺陷（任何经中间层转写 body 的部署都会复现）。

## What Changes

1. `jira-status-writeback` SOP 步骤 2 从「固定调用 `jira_add_comment`」升级为「保真通道判定」：写入 → 回读 `body` 比对关键 Wiki 栴记 → 失真（标记被转义/改写）时改用脚本直连 REST 写入（复用 `jira-read` 凭证链），并新增配套脚本 `scripts/update-comment-wiki.mjs`（新建/更新评论 + 内置回读保真校验）。
2. `jira-wiki-markup` 增加一句通道保真交叉指引（适用于任何 wiki 字段写入，不重复规则）。

## Impact Analysis

- 受影响 skill：`jira-status-writeback`（SOP 步骤 2 正文 + 版本 PATCH）、`jira-wiki-markup`（+1 节，无契约变更）。
- 铁律 9 反查：`jira_add_comment` 另被 `jira-wiki-markup` spec、`opsx-jira-fix-workflow` spec、`workflow-contract-sync` spec 提及——前者措辞为 "(or equivalent)" 通道无关，后两者契约（body 参数 + Wiki 组合）在 REST 回退通道下同样成立，判定保留；委托关系（宿主 → `jira-status-writeback`）不变。
- 平台无关（铁律 6）：不点名任何 MCP 实现，描述为「转写 body 的中间层可能转义或改写标记」，判定输入可核验（回读 body 内容比对）。
- 脱敏（铁律 2）：全程使用占位（PROJ-123、example.com），不含内部域名/项目/Jira ID。
