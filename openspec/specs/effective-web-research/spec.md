# effective-web-research Specification

## Purpose
外部 web 调研纪律的共享契约：先路由（内部 vs 外部），外部调研默认应用 4 条准则（权威优先、查时效、交叉验证、跳过内容农场），严格模式跑 7 维来源可信度评估（CRAAP + E-E-A-T）。当静态层（WebSearch/WebFetch/curl）无法抵达内容时，升级到真实浏览器（运行时局部强依赖外部 `web-access` skill 的 CDP，带登录态）作为逃生出口——纪律与操控正交叠加。核心调研纪律不依赖 web-access。

## Requirements

### Requirement: effective-web-research SHALL 在静态层无法获取目标内容时升级到 CDP（via web-access），且为运行时局部强依赖

当静态层（WebSearch / WebFetch / curl / Jina）返回的内容缺少目标信息（登录墙、JS 动态渲染 shell、反爬拦截）时，`effective-web-research` MUST 升级到真实浏览器操控——加载 `web-access` skill 并按其指引执行（CDP 直连用户已登录的日常浏览器）。升级时 MUST 做运行时检查：确认 `web-access` skill 在场，缺失则**中止该 CDP 路径并提示安装 web-access**（不静默降级到其他工具）。此升级与既有的来源可信度纪律（CRAAP + E-E-A-T）MUST 正交叠加（纪律评估可信度，CDP 解决抵达）。核心调研纪律（静态层）MUST NOT 依赖 `web-access`——仅 CDP 升级路径依赖，且 `effective-web-research` 的 frontmatter MUST NOT 声明对 `web-access` 的 `dependencies`（避免拖累核心能力与向上传染）。

#### Scenario: 静态层失效升级 CDP

- **WHEN** WebFetch / curl 返回的内容缺少目标信息（登录墙、动态渲染 shell、反爬拦截）
- **THEN** 加载 `web-access`，运行时检查其在场（缺失则中止 + 提示安装），通过 CDP 直连用户已登录浏览器获取内容，并对获取内容继续应用可信度纪律

#### Scenario: 核心调研不依赖 web-access

- **WHEN** 仅用静态层（WebSearch / WebFetch）完成调研、未触发 CDP 升级
- **THEN** `effective-web-research` 正常工作，不要求 `web-access` 在场

#### Scenario: 不向 workflow 上游传染外部 plugin

- **WHEN** `known-issue-research`（强依赖 `effective-web-research`）或其上游 workflow 执行前置检查
- **THEN** 解析到的是 `effective-web-research` 自身，不要求安装外部 `web-access` plugin（因其未声明 frontmatter `dependencies`）
