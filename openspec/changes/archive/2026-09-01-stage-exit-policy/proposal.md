# Proposal: stage-exit policy

## Why

First field incident of the v2.14.0 system (`docs/goal-driven-batch-child-question-leak-incident.md`): after a 5-ticket intake + approval bought the task-level WHAT, the child run (Engine: opsx-solve-workflow, trigger 「启动」 without 「自动」) still asked the user 4 times at process-level stops — trigger-word mode default contradicts the queue's detach-run-accept promise, the counterpart option defaulted off with a mis-described consequence, one factual self-answer (branch baseline) was never verified before dispatch, and no contract field told the child how to handle its stage exits. The counterpart mechanism itself ran flawlessly once enabled. Same exposure verified for `Engine: solve-workflow`.

## What Changes

- **Interaction-budget ticket (fixed first ticket)**: enqueue interview opens with a three-way choice — A full-human (child manual, every exit asks) / B AI-counterpart proxy (`Stage-exit policy: counterpart`: child auto + counterpart checkpoints per charter, ledger trail) / C auto-escape (child auto, named escapes). It absorbs the former counterpart decision item and explicitly tells the user the layer split: intake tickets freeze task-level WHAT; process-level forks that emerge during analysis belong to the layer this ticket assigns.
- **`Stage-exit policy` card field** (single knob, replaces `Counterpart`): `manual-pause | counterpart | auto-escape`, set by the interaction-budget ticket, passed to the child along with `Engine`, overriding trigger-word mode propagation for all three engines. Absent field → legacy trigger-word rule (behavior identical to pre-policy versions); a legacy `Counterpart: on` line reads as `counterpart`.
- **Factual self-answer verification at dispatch**: Decisions-I-made entries marked `factual` (branch baselines, dependency existence, target paths — vs `preference`) are cheaply verified at the consumption-entry check (symbol-exists grep / `git branch --contains` / merge-base topology); a falsified entry parks the card there instead of surfacing as a mid-run clean stop.
- **Stop-point forecast (dual solve hosts)**: when `solve-workflow` / `opsx-solve-workflow` start as queue children, they open with a forecast table — every manual exit × covered-by-frozen-decisions vs will-form-a-new-ticket — so the interaction budget's owner knows the interaction count before analysis begins.
- **Consequence-description discipline**: intake self-answer consequence text MUST be derived by walking the enqueue configuration → child default behavior path as actually configured (a mis-described consequence is worse than none).

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `goal-queue`: ADDED 交互预算票与阶段出口策略 + 消费入口事实性代答实证; MODIFIED 模式向子运行传播 / 对手方检查点接线 / 子任务引擎可选调度 (policy semantics).
- `ai-counterpart`: MODIFIED 宿主接线契约 (opt-in wording → policy) / PDCA 宿主出口接线 (+ forecast table).
- `goal-run`: MODIFIED 对手方检查点接线 (policy wording); ADDED policy mapping for the goal engine.

## Impact

- `skills/goal-driven-batch/` (0.8.0), `skills/solve-workflow/` (1.26.0), `skills/opsx-solve-workflow/` (1.20.0), `skills/intake-interview-discipline/` (0.4.0), incident doc committed + indexed, index regenerated.
