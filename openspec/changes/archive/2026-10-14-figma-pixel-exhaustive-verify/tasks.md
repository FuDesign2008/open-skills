# Tasks: figma-pixel-exhaustive-verify

## 1. figma-pixel-implement 1.7.0 → 1.8.0

- [x] 1.1 SKILL.md Workflow 6 增穷举展开规则（节点树 → 行；文本全部排版四元组；容器绝对坐标链；禁抽样；out-of-scope 显式）
- [x] 1.2 SKILL.md 增基准导出交付（Reference exports：node id + 路径 + 比例；差分基线）
- [x] 1.3 reference.md 同步（spec 模板/清单若涉及）
- [x] 1.4 Pitfalls 增：抽样建表 / 无基准导出
- [x] 1.5 version bump 1.8.0

## 2. figma-pixel-verify 1.9.0 → 1.10.0

- [x] 2.1 SKILL.md Workflow 重排：Preflight → **Source reconciliation（门）** → Vision → **Differential sweep** → Numeric（含墨迹口径）→ Compare → Fix loop → **Independent re-check** → Report
- [x] 2.2 SKILL.md 增：对账门（未对账不得测量；基准图缺失 FAIL 回 implement）
- [x] 2.3 SKILL.md 增：差分扫漏（同框并排 + 可选 diff 产物；差异转行/residual；产物路径入报告）
- [x] 2.4 SKILL.md 增：多行文本墨迹口径（行数/墨迹起点/断行内容/悬挂量）
- [x] 2.5 SKILL.md 增：独立复核三级阶梯 + 记录要求
- [x] 2.6 SKILL.md Report 节：PASS 条件纳入对账表、差分产物、独立复核行
- [x] 2.7 reference.md Report template 增三节（Source reconciliation / Pixel differential / Independent check）
- [x] 2.8 Pitfalls 增：跳过对账 / 无差分扫漏 / 同源自审冒充独立 / 文本仅量盒
- [x] 2.9 version bump 1.10.0

## 3. checker 与验证

- [x] 3.1 check-figma-verify-report.mjs：增校验（Source reconciliation / Pixel differential 产物存在性 / Independent check 行）
- [x] 3.2 check-figma-verify-report.test.mjs：同步用例（含负例）
- [x] 3.3 `npm run lint:deid`
- [x] 3.4 `npm run lint:skill-description`
- [x] 3.5 `node --test skills/figma-pixel-verify/scripts/check-figma-verify-report.test.mjs`
- [x] 3.6 `openspec validate figma-pixel-exhaustive-verify`
- [x] 3.7 契约变更反查（铁律 9）：grep 主 specs 提及被改项的措辞，逐一判定同步
