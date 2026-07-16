## Tasks

- [x] 1. **solve-workflow** `skills/solve-workflow/SKILL.md`：行 127 标题 → `（硬纪律：单轮单问、多轮逐个）`；行 129 首句 → `**单轮只问一个最关键的问题、多轮逐个推进**`
- [x] 2. **opsx-solve-workflow** `skills/opsx-solve-workflow/SKILL.md`：行 256 标题式 → `**⚠️ 单轮单问、多轮逐个（硬纪律，无条件适用）**`；行 364 Red Flags 引用名同步 → `（违反「单轮单问、多轮逐个」硬纪律）`
- [x] 3. **jira-fix-workflow** `skills/jira-fix-workflow/SKILL.md`：行 130 标题 → `（硬纪律：单轮单问、多轮逐个）`
- [x] 4. **think-big** `skills/think-big/SKILL.md`：行 111 英文补 `(hard rule — one per turn, not one total; you may follow up across rounds)`
- [x] 5. **opsx-jira-fix-workflow** `skills/opsx-jira-fix-workflow/SKILL.md`：行 193 核对（已含「得到回答后再问下一个」，未改）
- [x] 6. **复查**：`grep -rn "一次只问一个"` 确认纯歧义标题已清除（仅 snapshot 副本旧措辞，按 D4 设计不动）；snapshot 确认未动
- [x] 7. **验证**：`openspec validate clarify-one-question-multi-turn --strict` → valid
- [ ] 8. **归档时**：`openspec archive` → Requirement 1 的 MODIFIED delta sync 到 `openspec/specs/clarifying-question-discipline/spec.md`
