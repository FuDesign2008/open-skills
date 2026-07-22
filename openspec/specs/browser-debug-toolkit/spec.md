# browser-debug-toolkit Specification

## Purpose
浏览器运行时调试工具包的共享契约：按问题场景选择 DevTools / CDP 工具进行运行时检查与操控。两条 CDP 通道互补——chrome-devtools-mcp（inspect，DevTools 面板，fresh session 无登录态）与外部 `web-access` skill 的 CDP Proxy（control + verify，带登录态、curl 可批处理，运行时局部强依赖）。也覆盖 Playwright。

## Requirements

### Requirement: browser-debug-toolkit SHALL 将 web-access CDP Proxy 作为 chrome-devtools-mcp 的并列实时操控手段纳入 Scene→Tool 决策表（运行时局部强依赖）

`browser-debug-toolkit` MUST 在 Scene→Tool 决策表中把 `web-access` 的 CDP Proxy 作为 `chrome-devtools-mcp` 的并列实时操控手段**显式纳入表内**（不止出现在表外对比节），并给出选择判断：`chrome-devtools-mcp` 偏"检查"（DevTools 面板能力、fresh session 无登录态），CDP Proxy 偏"操控 + 验证"（带登录态、curl 可批处理脚本化、`/clickAt` 真实手势、`/eval` 读写 DOM、`/screenshot` 采帧）。调试场景需要登录态复现、需要批量操作复现、或 MCP 不可用时 MUST 优先选 CDP Proxy；当 bug 同时需要检查（computed style）与登录态时 MUST 以 CDP Proxy 为准（登录态是更硬的约束）。使用 CDP Proxy 前 MUST 运行时检查 `web-access` 在场，缺失则中止 + 提示安装。`browser-debug-toolkit` 的 frontmatter MUST NOT 声明对 `web-access` 的 `dependencies`（避免拖累核心调试决策与向上传染 solve-workflow 等）。

#### Scenario: 决策表表内纳入 CDP Proxy

- **WHEN** 查阅 Scene→Tool 决策表
- **THEN** 表中显式列出 CDP Proxy 作为并列实时操控手段（如新增列或相关场景行注明），不只出现在表外对比节

#### Scenario: 需要登录态的调试复现

- **WHEN** 调试一个仅在登录态下复现的 UI/交互问题
- **THEN** 选用 `web-access` CDP Proxy（运行时检查其在场，缺失则中止 + 提示安装），直连用户已登录浏览器，而非无登录态的 chrome-devtools-mcp

#### Scenario: 强依赖不引入外部传染

- **WHEN** `solve-workflow`（强依赖 `browser-debug-toolkit`）执行前置检查
- **THEN** 不要求安装外部 `web-access` plugin（因 `browser-debug-toolkit` 未声明 frontmatter `dependencies`）；仅当实际进入 CDP 调试路径时才运行时检查 web-access
