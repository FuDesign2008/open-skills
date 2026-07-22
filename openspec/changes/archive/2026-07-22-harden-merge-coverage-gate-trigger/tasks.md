## 1. Reference.md 门控规范同步（三处契约源，v1 → v2）

- [x] 1.1 重写 `skills/opsx-solve-workflow/reference.md` 门控规范章节：门控规范版本 v1 → v2；触发条件扩展为「合并动作」本身；前置检测收紧（未发现 → 提示+留痕，不静默跳过）；判定矩阵新增「隐式漏跑」行；新增「合并前检查清单」小节
- [x] 1.2 同步重写 `skills/jira-fix-workflow/reference.md` 门控规范章节（内容与 1.1 完全一致，仅留痕位置声明为 `08-merge.md` 和 PR 描述）
- [x] 1.3 同步重写 `skills/opsx-jira-fix-workflow/reference.md` 门控规范章节（内容与 1.1 完全一致，仅留痕位置声明为 PR 描述和 `design.md` Verification Notes）

## 2. SKILL.md 门控小节摘要同步（三处摘要+引用）

- [x] 2.1 更新 `skills/opsx-solve-workflow/SKILL.md` 阶段 8「顺序约束」与「合并前覆盖率门控」小节：触发条件文本对齐 v2；加「合并命令前置检查」强制提醒；frontmatter `version` 从 1.7.0 → 1.7.1（PATCH）
- [x] 2.2 更新 `skills/jira-fix-workflow/SKILL.md` 阶段 10 步骤 2.1 门控小节：触发条件文本对齐 v2；加「合并命令前置检查」强制提醒；Red Flags 区追加「隐式漏跑」一条；frontmatter `version` PATCH 升级
- [x] 2.3 更新 `skills/opsx-jira-fix-workflow/SKILL.md` 8.4 顺序约束与 8.4.1 门控小节：触发条件文本对齐 v2；加「合并命令前置检查」强制提醒；Red Flags 区追加「隐式漏跑」一条；frontmatter `version` PATCH 升级

## 3. 验证

- [x] 3.1 `openspec validate harden-merge-coverage-gate-trigger` 通过
- [x] 3.2 grep 校验三处 reference.md 门控规范文本一致（除留痕位置声明外）
- [x] 3.3 grep 校验三处 SKILL.md 触发条件文本对齐 v2
- [x] 3.4 AGENTS.md 验证命令通过：JSON 格式、SKILL.md frontmatter、skills 索引一致性（`node scripts/gen-skill-docs.mjs` + `git diff --exit-code`）
- [x] 3.5 全库双语残留清扫（v1 → v2 残留、旧触发条件文本残留）
