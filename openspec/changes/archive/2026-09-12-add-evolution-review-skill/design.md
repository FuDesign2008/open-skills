# Design: add `evolution-review` skill

## Decisions

1. **英文正文 + 中文触发词**（AGENTS.md 铁律 3）：正文英文化，description 保留中文触发词与英文等价词——与 tech-research-workflow（PR #310）同款。
2. **溯源降为口头声明**：来源业务为私有仓库，跨仓相对路径对 npx 分发用户不可验证——溯源节只留聚合数字与一句 prose，零路径引用（Part R Minor② 的修复）。
3. **记录性归档**：实现先于沉淀（v1.0.0 已开 PR 后才补 openspec 沉淀）——按 merge-discipline Part R 修复轮补做，tasks.md 如实标注时序。
4. **与 learn-and-improve 的边界**：portfolio 级月度选择 vs 单任务复盘；本 skill 侧 description 单向 Do-NOT-use 指向 learn-and-improve（对方 v1.0.3 未改动、未互指——保持其版本不动）。

## Verification Notes

- 【覆盖率门控跳过】工程偏好 coverage-gate: never。时间：2026-09-12。决策人：项目配置。
- Part R light 审查 FAIL（正文语言）→ 修复后按「post-fail re-entry」升级 full 重审（见 PR #312 review comment 线程）。
