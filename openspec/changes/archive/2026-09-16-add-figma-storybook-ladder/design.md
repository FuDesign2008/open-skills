## Context

本变更由一次跨工程 Storybook 调研触发（模式级借鉴，证据为对方仓库源码精读：四 stub 隔离、可拖宽演练台、living spec Verify 表实测、验收后测试锁定）。方案经双轴九维审查两轮通过（two-way door，standard depth；4 项非阻断 + 2 个开放问题均按默认收敛）。阶段 1–7 的分析与验证先于本 artifact 完成（solve-workflow 升级为 OPSX 持久化），执行结果已暂存于 feature 分支 `feat/figma-pixel-storybook-ladder`。

## Goals / Non-Goals

- **Goals**: 验证面体系化（隔离组件工作台优先）；缺基建建议引入（非阻断）；有基建时 story + 组件测试成为交付物；报告通道声明 + 真机权威保留
- **Non-Goals**: 不新建独立 skill（单消费方 YAGNI，留作未来抽取点）；不改 4 个 PDCA 宿主与 `test-suite-ensure`（薄引用自动继承）；不做硬阻断；不改 living artifact 四段式对外契约（Inventory/Spec/Assets/Verify 所有权不变）

## Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | 零新建 skill，改 2 个 figma skills | 单消费方；lazy creation；未来出现第二个 UI 测量类 skill 再抽取 |
| D2 | 通道四级阶梯（story → 隔离面 → 预览 → 启动 APP 最后） | 启动 APP 重且非体系化；story 靶场体系化、人可观察、AI 可测 |
| D3 | 「隔离 ≠ 模拟」显式声明 | 防止 Agent/读者把 story 误读为仿真环境：story 是真实渲染，阶梯排的是集成完整度×成本 |
| D4 | 真机/宿主地板保留最终权威；workbench PASS ≠ 平台地板证明 | 组件工作台浏览器通常新于宿主引擎；报告强制通道声明 + 平台地板提示 |
| D5 | 基建建议 advisory（一次性、非阻断） | 验证必须始终可完成；建议措辞进 Preflight 一句 + reference 说理段 |
| D6 | story/测试按比例交付 | 只覆盖本轮实现的组件/区块的 inventory 行；无测试基建记录建议不搭建全套 |
| D7 | 声明式状态入口（testid/knob/auto-action）计入「已到达该状态」 | 降低真实指针操作链的时序脆弱性，测量可重复 |
| D8 | Inventory 增加 `context` 轴（宽度地板/预设点/挤压） | 真实宿主会拖宽/挤窄组件，单一死宽验收不充分 |

## Risks / Trade-offs

- 正文膨胀 → 意图进 SKILL.md、细节进 reference.md（渐进披露）；description 全部 ≤1024 且 ≤950 软目标（lint 实证 0 warning）
- 脱敏（铁律 2）→ 全文模式级描述、不含任何真实工程名；`lint:deid --staged` 实证通过
- 「story-first」被误读为「story-pass 即完成」→ D4 通道声明 + 平台地板提示 + Pitfalls 两条双保险
- 小修复场景被要求写全量 story → D6 按比例收敛到本轮 inventory 行

## Migration Plan

无破坏性变更。两 skill version 递增（1.5.0 / 1.6.0）；`docs/generated/skills-index.md` 自动重生成并已验证与 CI 一致；下游宿主零改动。

## Open Questions

无——审查阶段的 Q1（建议措辞强度）与 Q2（回归锁定定位）均按默认方案落地（Preflight 一句 + reference 一段；锁定为建议性交付物）。
