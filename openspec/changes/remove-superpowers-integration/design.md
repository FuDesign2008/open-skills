## Context

可选增强（Superpowers 点名 + env-capability-discovery）经评估为软建议、不保证调用。用户选定方案 C：宿主只保留内置流程与强依赖。

## Goals / Non-Goals

**Goals**

- 清除四宿主中的 Superpowers / env 探索叙事与依赖。
- 删除 `env-capability-discovery` skill 并 REMOVED 其主 spec 能力要求。
- 同步 AGENTS.md 与 workflow-contract-sync。

**Non-Goals**

- 不削弱 `ensure-tests`、`analysis-core`、调试 skill、`merge-discipline` 等强依赖。
- 不引入「禁止安装 Superpowers」规则；只是宿主不再编排调用。
- 不重写 PDCA 阶段结构。

## Decisions

1. **删除 skill 文件**，而非留孤儿：方案 C 下无引用方，保留会误导索引与安装。
2. **验证证据原则**：不另挂 Superpowers；阶段验证仍靠现有「诚实标注 / ensure-tests / 跑测试」正文，不回填 verification-before-completion 点名。
3. **jira-fix state.json**：去掉 `enhanced_capabilities` 字段说明（若仅服务 env 扫描）。

## Risks / Trade-offs

- 跨平台「碰巧有好 skill」不再被引导调用 → 可接受；需要时用户显式唤起该 skill。
- 主 spec 删除 env 能力后，历史 archive 仍提及 → 正常，不改 archive。

## Migration Plan

1. 改四宿主 + clarifying 举例 + AGENTS + reference state。
2. 删 `skills/env-capability-discovery/`。
3. archive 本 change，合并主 specs。
4. 全局安装更新。

## Open Questions

（无）
