# Design: figma-pixel-exhaustive-verify

## Context

- 一手实证：某官网弹窗 Figma 改版全过程的对话记录（首轮 10/10 PASS → 人工复核 13 项差异 → 全量复查收敛），脱敏引用。
- 现行契约与两 skill 源码均已核对（figma-pixel-fidelity 主 specs 25 条需求；implement v1.7.0 / verify v1.9.0）。

## 决策

### D1 对账门的输入必须可机械核验（铁律 10）

源对账的输入不是"作者觉得覆盖够了"，而是**两个可计数的集合**：Figma 源机械导出的 expected-item 清单（可计数、可枚举）× Spec 行集合。对账表（应有项数/覆盖数/补行数/out-of-scope 数）写入报告——任何缺口在三张表中都有确定归属。checker 校验报告含 `Source reconciliation` 行，机器可判存在性。

### D2 差分扫漏的产物是"文件"而非"印象"

"同框并排"（同尺寸基准图 × 实现截图）是**最小机械产物**——不依赖模型视觉能力的存续性；逐像素 diff 图在工具链允许时追加。产物路径入报告并被 checker 要求存在性。这样"扫过漏"与"声称扫过"可被外部区分。

### D3 独立复核用三级阶梯表述（铁律 6：描述意图而非工具）

意图 = **检查上下文独立于实现上下文**。阶梯：fresh-context agent run → 不同模型 → blind re-source check（不看作者 Spec、直接从 Figma 源重新清点）。不枚举"X 平台用 A 工具"；记录的是方法 + 复核者 + 产物路径（可核验）。同上下文自读明确不算独立。

### D4 checker 强制行的兼容策略

新增必备行只对**新跑的 verify run** 生效（checker 在每次 verify 结束时被调用一次，报告由该次 run 现场生成）；已归档的存量报告不重检，避免破坏性回溯。

### D5 description 与触发路由保持稳定

两 skill 的 frontmatter `description` 不改（触发词与路由边界是稳定契约，铁律 7 的 1024 上限内已饱满）；行为增强全部落在正文与 reference。version bump：implement 1.8.0 / verify 1.10.0。

### D6 穷举的成本控制

"每个 fetched 节点产出行"仅约束 **in-scope 的 fetched 节点**（大 frame 本就分节 fetch）；纯装饰层可用一条 out-of-scope 汇总（含理由）。这与 implement 既有的"every visible child section"分节策略一致，不引入全量重拉。

## 风险与缓解

- **风险：穷举拉长 Spec 表** → 缓解：D6 的 in-scope 边界 + out-of-scope 汇总行；收益是首轮收敛（对比例证：13 项差异的成本远高于建表成本）。
- **风险：对账依赖 implement 的基准导出** → 缓解：基准图缺失 = FAIL 回 implement（与既有 missing-spec 处理同构），把缺口挡在 verify 之前。
- **风险：独立复核在单会话环境不可得** → 缓解：允许记录"不可得 + 已尝试方法"降级，但报告不得虚称已复核（如实性优先，铁律 1）。

## Verification Notes

- 变更后验证：`npm run lint:deid`、`npm run lint:skill-description`、checker 单测（`node --test skills/figma-pixel-verify/scripts/check-figma-verify-report.test.mjs`）、`openspec validate figma-pixel-exhaustive-verify`。
- 铁律 9 反查：主 specs 中"提及被改项"的需求（`measure the running UI against the spec` / `treat vision screenshots as supporting evidence` / `produce a design-spec table`）已逐一判定——增强与既有语义不冲突（对账/差分/墨迹/独立均为叠加约束），故采用纯 ADDED；`SHALL fail overall when critical inventory rows are unmeasured` 与对账门兼容（对账扩行 → 待测集合扩大 → 该需求更强地成立）。
