# goal-run Delta: counterpart checkpoints

## ADDED Requirements

### Requirement: goal-run 对手方检查点接线

`goal-driven-workflow` SHALL declare `ai-counterpart-discipline` in frontmatter `dependencies` (prerequisite check with install guidance; abort on missing when opted in) and wire it, when the run contract records `counterpart: on`, at these thin-pointer checkpoints: intake Q&A (stage 1, absent human), contract approval as bounded pre-authorization, and the completion-report verification checklist check (stage 5). Checkpoint invocations count against the run budget; between checkpoints the §B ladder governs. When not opted in, stage behavior is identical to today.

#### Scenario: 缺席深谈由对手方应答

- **WHEN** 无人值守 goal 长跑 opted-in counterpart 且 stage 1 无真人在场
- **THEN** intake 逐决策提问由对手方按章程应答，决策入账本标记 counterpart-made，冻结契约照常产出

#### Scenario: 完成报告受质询

- **WHEN** stage 5 完成报告产出且 counterpart 开启
- **THEN** 报告的分项核对清单交对手方以盲上下文质询（证据标签裁决），未通过项打回重验或出票
