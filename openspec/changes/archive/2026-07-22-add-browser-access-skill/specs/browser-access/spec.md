# browser-access Specification (Delta)

## ADDED Requirements

### Requirement: browser-access SHALL 通过 CDP Proxy 直连用户日常浏览器并提供 HTTP API 操控

`browser-access` skill MUST 通过 `${CLAUDE_SKILL_DIR}/scripts/check-deps.mjs` 检查环境（Node.js 22+、浏览器远程调试端口）并确保 CDP Proxy 就绪，随后 MUST 通过 `http://localhost:3456` 的 HTTP API（`/new` `/eval` `/click` `/clickAt` `/setFiles` `/scroll` `/screenshot` `/navigate` `/back` `/close` `/targets` `/info`）操控用户日常浏览器（Chrome / Edge / Chromium 系），天然携带登录态，无需启动独立浏览器。所有操作 MUST 在自创建的后台 tab 中进行，不主动操作用户已有 tab，任务结束 MUST 关闭自建 tab。

#### Scenario: 登录态动态页面获取

- **WHEN** 目标内容需要登录态或位于 JS 动态渲染 / 反爬平台（如小红书、公众号）
- **THEN** `browser-access` 通过 CDP Proxy 直连用户已登录的日常浏览器，用 `/new` 打开页面、`/eval` 读取 DOM、必要时 `/screenshot` 采帧，获取目标内容后 `/close` 自建 tab

#### Scenario: 环境检查的退出码语义

- **WHEN** 运行 `check-deps.mjs`
- **THEN** `exit 0` 表示继续；`exit 2` 表示需询问用户浏览器偏好并写入 `config.env` 的 `WEB_ACCESS_BROWSER`；`exit 1` 表示按 stdout 错误信息处理

### Requirement: browser-access SHALL 作为 open-skills 内部 skill 随仓库安装

`browser-access` MUST 是 open-skills 仓库内的 skill（`skills/browser-access/`），随 `npx skills add FuDesign2008/open-skills` 一起安装，MUST NOT 在运行时依赖任何外部 plugin。SKILL.md 顶部 MUST 保留上游来源（`eze-is/web-access` v2.5.3）与 MIT 版权声明。`user-invocable` MUST 为 `true`（既被两个目标 skill 强依赖，也可直接调用）。

#### Scenario: 无外部 plugin 依赖

- **WHEN** 用户仅安装了 open-skills（未安装外部 web-access plugin）
- **THEN** `browser-access` 及其强依赖者（effective-web-research / browser-debug-toolkit）的前置检查不指向外部 plugin，能力完整可用

### Requirement: browser-access SHALL 沉淀站点经验并支持子 Agent 并行分治

`browser-access` MUST 把已验证的站点操作经验按域名写入 `references/site-patterns/{domain}.md`（含平台特征、有效模式、已知陷阱 + 发现日期），作为跨 session 的先验提示；多独立目标时 MUST 鼓励分治给子 Agent 并行执行（共享一个 Proxy、tab 级隔离）。

#### Scenario: 站点经验复用

- **WHEN** 确定目标网站且 `references/site-patterns/` 存在匹配的域名经验文件
- **THEN** 操作前 MUST 读取该经验文件获取先验知识；按经验操作失败时 MUST 回退通用模式
