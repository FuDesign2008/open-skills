# effective-web-research Specification (Delta)

## ADDED Requirements

> 说明：`effective-web-research` 此前未纳入 `openspec/specs/` 管理，本 delta 以 `ADDED Requirements` 首次建立其行为契约。

### Requirement: effective-web-research SHALL 在静态层无法获取目标内容时升级到 CDP

当 WebSearch / WebFetch / curl / Jina 等静态层无法获取目标内容（目标需要登录态、位于 JS 动态渲染页面、或处于已知反爬限制的平台如小红书 / 微信公众号）时，`effective-web-research` MUST 升级到真实浏览器操控——加载 `browser-access` skill 并按其指引执行，作为"静态层拿不到目标内容时的逃生出口"。此升级能力与既有的来源可信度纪律（CRAAP + E-E-A-T）MUST 正交叠加（纪律评估可信度，CDP 解决抵达），不相互取代。

#### Scenario: 静态层失效升级 CDP

- **WHEN** WebFetch / curl 返回的内容缺少目标信息（登录墙、动态渲染、反爬拦截）
- **THEN** `effective-web-research` 加载 `browser-access`，通过 CDP 直连用户已登录浏览器获取目标内容，并对获取到的内容继续应用来源可信度纪律

#### Scenario: 一手来源直达

- **WHEN** 信息核实类任务定位到一手来源（官网、官方平台、原始页面）但该来源需要登录态或动态渲染
- **THEN** 经 `browser-access` 的 CDP 直达一手来源读取原文，而非依赖二手聚合

### Requirement: effective-web-research SHALL 强依赖 browser-access

`effective-web-research` MUST 在 frontmatter `dependencies` 中声明 `browser-access`，使浏览器操控能力成为其联网能力的强保证部分（前置检查保证 `browser-access` 在场，无静默降级）。

#### Scenario: 加载即保证浏览器操控能力

- **WHEN** `effective-web-research` 被激活且任务需要真实浏览器
- **THEN** 前置检查确保 `browser-access`（open-skills 内部 skill）可用，AI 可直接按 CDP HTTP API 操作
