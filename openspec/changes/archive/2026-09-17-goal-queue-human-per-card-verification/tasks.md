## 1. OpenSpec 契约（delta specs/goal-queue/spec.md）

- [x] 1.1 ADDED Requirement「执行后人工逐卡核对与独立核对文档」（含 6 个场景）
- [x] 1.2 MODIFIED `进度文档与验收包`：纳入独立核对文档 + 逐卡裁决门（全文覆盖）
- [x] 1.3 MODIFIED `队列级验收核对清单`：新增「核对覆盖度」项（全文覆盖）
- [x] 1.4 MODIFIED `验收包汇总决策与假设台账`：台账项同时进入各卡核对节（全文覆盖）
- [x] 1.5 MODIFIED `交互预算票与阶段出口策略`：同步「最终验收包」措辞为逐卡核对（全文覆盖）
- [x] 1.6 MODIFIED `goal-queue 代理检查点接线`：逐卡裁决席位真人专属（全文覆盖）
- [x] 1.7 `openspec validate goal-queue-human-per-card-verification` 通过

## 2. SKILL.md

- [x] 2.1 收尾阶段扩展为「验收包 + 人工逐卡核对」；Path Overview 第 3 阶段行同步
- [x] 2.2 验收态说明：`done`=引擎完成；核对态 awaiting/verified/returned 记于 Acceptance Summary
- [x] 2.3 逐卡核对门：批次在所有已执行卡获裁决前不得表述为已验收；批次摘要计数
- [x] 2.4 逐卡裁决真人专属（薄引用 ai-proxy），代理不得代填
- [x] 2.5 生成独立核对文档 verification.md（派发器单写者）
- [x] 2.6 Red Flags 增补：不得自证裁决 / 不得在 awaiting 时表述已验收
- [x] 2.7 frontmatter 版本 minor bump

## 3. reference.md

- [x] 3.1 Task Card：Acceptance Summary 增 `Verification:` 行
- [x] 3.2 Progress Document 表新增 `Verification` 行
- [x] 3.3 Batch Summary 模板增核对计数与核对文档路径
- [x] 3.4 新增「Verification Document」模板段
- [x] 3.5 Defaults 增补核对默认（缺字段行为不变）

## 4. Evals（evals/evals.json）

- [x] 4.1 新增用例：批次收尾生成独立核对文档 + awaiting 状态 + 未裁决不得表述已验收
- [x] 4.2 新增用例：代理不得代出逐卡裁决（保持 awaiting）

## 5. 收尾

- [x] 5.1 `node scripts/gen-skill-docs.mjs` 重新生成索引
- [x] 5.2 `node scripts/lint-skill-description.mjs` 与脱敏 lint 通过
- [x] 5.3 archive 变更（合入主 specs）
