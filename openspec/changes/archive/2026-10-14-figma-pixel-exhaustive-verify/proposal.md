# Proposal: figma-pixel-exhaustive-verify

## Why

实战复盘（某官网弹窗 Figma 改版，脱敏）：首轮 verify 对自建 Spec 表报告 "10/10 PASS"，随后人工复核发现 **13 项差异**（行高 44≠43 引发的整条坐标链 1px 级联、字重 500 缺失、全部绝对坐标未入表、悬挂缩进 23px/图距 12px、墨迹缩进 8.5px），历经两轮全量复查（基准图导出 + 逐像素扫描）才收敛；过程还需人工两次介入（①"还有很多没有像素级还原" ②跨模型复核）。

四个机制缺口（一一对应上述现象）：

1. **Spec 表抽样建表**——`figma-pixel-implement` 只要求 "measurable rows + 最小列"，无"从节点树机械穷举"规则。行不存在 → verify 永远测不到（unknown unknowns）。
2. **验收无源对账**——verify 的 coverage 两端都在自写活文档内，自证循环；PASS 的门禁输入（行清单）是作者自由判断而非可核验事实（违铁律 10 精神）。
3. **无像素差分扫漏**——行驱动测不出清单外差异；且 Figma 基准导出图非必交付，差分前提在首轮根本不存在。
4. **同源自审 + vision 弱**——实现者同上下文验证共享同一理解偏差；独立复核无机制位（人工切模型在补此洞）。

## What Changes

- **figma-pixel-implement 1.7.0 → 1.8.0**
  - Spec 行**穷举展开**：每个 fetched 节点产出位置/尺寸/自有属性行；文本节点含 typography 全元组（字号/字重/行高/颜色/对齐）与行数；容器含 padding/gap/radius/shadow 及子元素绝对坐标链；兄弟间距以 `basis` 记录关系。禁抽样，未覆盖须显式 `out-of-scope`（含理由）。
  - **Figma 基准导出图必交付**：每个 in-scope frame 的栅格导出存目标仓，记入活文档（node id + 路径 + 导出比例）；作为 verify 差分扫漏基线。
- **figma-pixel-verify 1.9.0 → 1.10.0**
  - **源对账（Source reconciliation）前置门**：从 Figma 源（节点树/基准图）机械导出"应有项清单"与 Spec 对账；缺行补行进 Spec；对账表入报告；未完成不得测量。基准图缺失 → FAIL 回 implement。
  - **像素差分扫漏（Pixel differential sweep）**：基准图 vs 本 run 实现截图同框并排 +（可行时）逐像素差分产物；差异转新行或 residual；产物路径入报告。
  - **多行文本墨迹口径**：行数 / 每行墨迹起点 / 断行内容 / 行内缩进与悬挂量——盒级量测不构成对齐覆盖。
  - **独立复核（Independent re-check）**：fresh-context / 跨模型 / blind re-source 任一（三级阶梯，平台无关表述）；方法、复核者与产物路径入报告；不可得须记录原因。
  - **checker 增校验**：报告必备 `Source reconciliation` / `Pixel differential` / `Independent check` 证据行（仅对新 run 生效，旧报告不重检）。

## Impact

- `skills/figma-pixel-implement/`（SKILL.md、reference.md、version）
- `skills/figma-pixel-verify/`（SKILL.md、reference.md、scripts/check-figma-verify-report.mjs 及其 test、version）
- `openspec/specs/figma-pixel-fidelity/spec.md`（delta 归档并入）
- 两 skill 的 `description` **不变**（触发路由稳定，铁律 7）
