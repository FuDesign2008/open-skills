# browser-debug-toolkit Specification (Delta)

## ADDED Requirements

> 说明：`browser-debug-toolkit` 此前未纳入 `openspec/specs/` 管理，本 delta 以 `ADDED Requirements` 首次建立其行为契约。

### Requirement: browser-debug-toolkit SHALL 将 CDP Proxy 作为 chrome-devtools-mcp 的并列实时操控手段

`browser-debug-toolkit` MUST 在 Scene→Tool 决策表中把 `browser-access` 的 CDP Proxy 作为 `chrome-devtools-mcp` 的并列实时操控手段纳入，并给出二者选择判断：`chrome-devtools-mcp` 偏"检查"（DevTools 面板能力），CDP Proxy 偏"操控 + 验证"（带登录态、curl 可批处理脚本化、`/clickAt` 真实手势、`/eval` 读写 DOM、`/screenshot` 采帧）。调试场景需要登录态复现、需要批量操作复现、或 MCP 不可用时 MUST 优先选 CDP Proxy。

#### Scenario: 需要登录态的调试复现

- **WHEN** 调试一个仅在登录态下复现的 UI/交互问题
- **THEN** `browser-debug-toolkit` 选用 CDP Proxy（经 `browser-access`）直连用户已登录浏览器，而非无登录态的 chrome-devtools-mcp

#### Scenario: 操控+验证的调试闭环

- **WHEN** 调试需要"操作→观察运行时状态→验证修复"的闭环
- **THEN** 用 CDP Proxy 的 `/click` `/eval` `/screenshot` 完成操作与采帧对比，而非仅静态检查

### Requirement: browser-debug-toolkit SHALL 强依赖 browser-access

`browser-debug-toolkit` MUST 在 frontmatter `dependencies` 中声明 `browser-access`。由于 `browser-access` 是 open-skills 内部 skill，此强依赖 MUST NOT 向 `solve-workflow` 等上游 workflow 引入外部 plugin 传染。

#### Scenario: 强依赖不引入外部传染

- **WHEN** `solve-workflow`（强依赖 `browser-debug-toolkit`）执行前置检查
- **THEN** 传递依赖解析到的是 open-skills 仓库内的 `browser-access`，随仓库安装，不要求用户额外安装外部 plugin
