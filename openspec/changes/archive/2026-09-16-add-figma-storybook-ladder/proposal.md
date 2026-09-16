## Why

跨工程实证调研确认：组件工作台（Storybook 或类似）能把「启动完整 APP/浏览器模拟」这类重验证替换为体系化、可观察、AI 可测量的隔离验证面，并原生承载 story 与组件测试。我们的 `figma-pixel-implement` / `figma-pixel-verify` 缺这一层：verify 要求 Runnable UI 却未定义通道选择策略（宿主耦合工程容易直接掉进最重路径或退化为 vision-only），implement 也不产出任何 story/测试资产——验收值没有回归锁定。

## What Changes

- `figma-pixel-verify` 新增**测量通道四级阶梯**：① 组件工作台 story（living artifact Stories 小节优先）→ ② 轻量隔离面（stub 断宿主/引擎依赖，保留真实 token）→ ③ 业务壳预览 → ④ 完整启动 APP/浏览器（最重，最后手段）；报告必须声明所用通道；检出宿主/平台地板时提示真机仍是最终权威
- 工程无组件工作台时，verify 给出**一次性引入建议**（advisory，不阻断验证）；工作台损坏沿阶梯下落
- `figma-pixel-implement` 的 Inventory 新增可选 `context` 维（宿主可变宽度/挤压轴）
- `figma-pixel-implement` 新增 **Stories & component tests** 交付物：有组件工作台时写 story 覆盖 Inventory 全部 state×context 行（声明式入口：testid/knob/auto-action）+ Stories 小节 + 组件测试锁定 Spec 关键值（无测试基建则记录建议不阻断）；无工作台记录引入建议
- 两侧 evals 各 +3 条覆盖新行为；version 递增（implement 1.4.0→1.5.0，verify 1.5.0→1.6.0）

## Capabilities

- **New Capabilities**: 无
- **Modified Capabilities**: `figma-pixel-fidelity`（2 条 MODIFIED requirements + 2 条 ADDED requirements，见 delta spec）

## Impact

- 4 个 PDCA 宿主（`solve-workflow` / `opsx-solve-workflow` / `jira-fix-workflow` / `opsx-jira-fix-workflow`）经薄引用自动继承新行为，**零改动**；`test-suite-ensure` 零改动（grep 实证无方法论复述）
- 变更面收敛于 `skills/figma-pixel-implement/`、`skills/figma-pixel-verify/`（SKILL.md + reference.md + evals.json）；无 API、依赖或分发面变更
- description 长度与脱敏门禁已复检通过（0 error 0 warning / 无新增内部标识符）
