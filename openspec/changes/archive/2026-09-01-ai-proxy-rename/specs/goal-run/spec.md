# delta (generated)

## RENAMED Requirements

### Requirement: goal-run 对手方检查点接线
- FROM: `### Requirement: goal-run 对手方检查点接线`
- TO: `### Requirement: goal-run 代理检查点接线`

## MODIFIED Requirements

### Requirement: goal-run 代理检查点接线

`goal-driven-workflow` SHALL declare `ai-proxy-discipline` in frontmatter `dependencies` (prerequisite check with install guidance; abort on missing when the run contract's Stage-exit policy is `proxy`) and wire it, when the launch contract records `Stage-exit policy: ai-proxy`, at these thin-pointer checkpoints: intake Q&A (stage 1, absent human), contract approval as bounded pre-authorization, and the completion-report verification checklist check (stage 5). Checkpoint invocations count against the run budget; between checkpoints the §B ladder governs. With any other policy value or none, stage behavior is identical to today.

#### Scenario: 缺席深谈由代理应答

- **WHEN** 无人值守 goal 长跑 Stage-exit policy: ai-proxy 且 stage 1 无真人在场
- **THEN** intake 逐决策提问由代理按章程应答，决策入账本标记 proxy-made，冻结契约照常产出

#### Scenario: 完成报告受质询

- **WHEN** stage 5 完成报告产出且 policy 为 proxy
- **THEN** 报告的分项核对清单交代理以盲上下文质询（证据标签裁决），未通过项打回重验或出票


### Requirement: goal-run 阶段出口策略映射

When dispatched as a queue child (or launched with the field in its contract), `goal-driven-workflow` SHALL honor the card's `Stage-exit policy` uniformly with the PDCA engines: `manual` → manual mode, stage exits pause for the present user; `proxy` → auto mode with the enumerated proxy checkpoints occupied per charter; `auto` → auto mode with named escapes + §B ladder (today's default child behavior). No field → legacy trigger-word propagation, identical to pre-policy versions.

#### Scenario: 三引擎同语义

- **WHEN** 队列以同一 Stage-exit policy 值派发 goal-driven-workflow / solve-workflow / opsx-solve-workflow 三种子运行
- **THEN** 三者对「运行期间谁回答问题」的处理语义一致（manual 停等真人 / proxy 代理坐席 / auto 具名逃逸），差异仅在各自的检查点/出口形状

