## ADDED Requirements

### Requirement: Standalone pre-run Design-checked Armed Launch

For a **standalone** invocation, `goal-driven-workflow` SHALL use the state machine Design-checked → Armed → Launch.

**Queue-child predicate (executable):** this invocation is a queue child **only when this turn's user/orchestrator dispatch message already supplied a frozen task card as stage 1 input**. Conversation history and on-disk `.goal-driven/` cards do **not** count. The host MUST NOT scan `.goal-driven/queues/` to classify the invocation. The host MUST NOT require a `queue-child` flag that the caller did not send. All other invocations are standalone.

- **Design-checked** is complete only when stages 1, 2, and 3 are complete **and** Stage 4 launch approval (final goal condition + budget + companion checklist) has been confirmed at the human seat (present human, or `Stage-exit policy: ai-proxy` occupying the enumerated approval checkpoint). A skip-ahead into stage 2 (invocation already carries a concrete verifiable goal + acceptance criteria) still MUST produce Template 1 (frozen block or an explicit stage-1-N/A line) and obtain one confirmation of that Template 1; that confirmation counts as stage 1 complete.
- **Armed** follows Design-checked. While Armed, the system MUST announce that pre-run checks are complete and MUST NOT start the long run.
- **Launch** starts Stage 4 execute only on an explicit user launch instruction from the closed list 「开跑」 / "launch" / "start the run" / 「开始长跑」 (and obvious same-phrase translations). The following MUST NOT count as Launch: 「自动模式」 / 「自动跑」 / "auto mode"; bare 「好的」 / "ok" / 「继续」 / "confirm". After Launch, the system MUST NOT re-ask stages 1–4 pre-run Q&A.
- If Design-checked is incomplete, the system MUST refuse Launch and continue the remaining pre-run checks — including when the user issues a launch instruction early.
- Auto mode (「自动模式」 / 「自动跑」 / "auto mode") MUST NOT skip stages 1–3 confirmation on standalone invocations. On standalone, a Template 1 `Stage-exit policy: auto` decides who answers mid-run questions; it MUST NOT skip Design-checked or auto-fire Launch.
- Instructional body and frontmatter description MUST NOT add off-hours / leave-work trigger words (e.g. 「下班」 / 「准备下班」); the gate is resident, not a keyword mode.
- Queue-child invocations (predicate above) MUST keep the mapping in `goal-run 阶段出口策略映射`; this state machine does not apply to them.
- Stage 5 human acceptance is unchanged.
- Starting the long run (Launch) is human-only even when `Stage-exit policy: ai-proxy`: the proxy MAY complete Design-checked (intake + contract approval checkpoints); it MUST NOT issue Launch.

#### Scenario: Incomplete check refuses launch

- **WHEN** a standalone run has not finished stages 1–3 (including skip-ahead Template 1 confirm) or Stage 4 launch approval, and the user issues a launch instruction
- **THEN** the system MUST NOT start the long run and MUST continue the remaining pre-run checks

#### Scenario: Armed waits for explicit launch

- **WHEN** a standalone run has completed Design-checked
- **THEN** the system enters Armed, announces that the run will not start until an explicit launch instruction, and MUST NOT start Stage 4 execute

#### Scenario: Explicit launch starts the run without re-asking

- **WHEN** the run is Armed and the user issues an explicit launch instruction
- **THEN** the system starts Stage 4 execute and MUST NOT re-open stages 1–4 pre-run Q&A; Stage 5 still ends at human acceptance

#### Scenario: Auto-mode words are not Launch

- **WHEN** a standalone run is Armed (or still in Design-checked) and the user says 「自动模式」 / 「自动跑」 / "auto mode"
- **THEN** those phrases MUST NOT start Stage 4 execute; Launch still requires a closed-list launch instruction

#### Scenario: Bare confirmation is not Launch

- **WHEN** a standalone run is Armed and the user says only 「好的」 / "ok" / 「继续」 / "confirm"
- **THEN** the system MUST NOT start Stage 4 execute

#### Scenario: Standalone auto does not skip stages 1–3

- **WHEN** a standalone invocation is in auto mode
- **THEN** stages 1, 2, and 3 still pause for confirmation at the human seat; auto MUST NOT advance those exits without confirmation

#### Scenario: Skip-ahead still completes stage 1

- **WHEN** a standalone invocation skips ahead to stage 2 because the input already has a concrete verifiable goal + acceptance criteria
- **THEN** the system still outputs Template 1 (freeze or stage-1-N/A) and requires one confirmation of it before stage 1 counts as complete for Design-checked

#### Scenario: Queue child is dispatch-supplied only

- **WHEN** this turn's dispatch text already supplied a frozen task card as stage 1 input
- **THEN** the invocation is a queue child: the card's frozen decisions supply stage 1, `Stage-exit policy` maps remaining exits as today, and this standalone state machine does not apply

#### Scenario: On-disk queue does not classify the invocation

- **WHEN** `.goal-driven/queues/` contains cards but this turn's dispatch did not supply a frozen task card as stage 1 input
- **THEN** the invocation is standalone; the host MUST NOT treat those on-disk cards as queue-child supply

#### Scenario: No leave-work trigger words

- **WHEN** an agent reads `goal-driven-workflow` frontmatter description and instructional body
- **THEN** those texts MUST NOT list 「下班」 / 「准备下班」 / equivalent off-hours phrases as trigger words

#### Scenario: Proxy may Arm, not Launch

- **WHEN** a standalone invocation records `Stage-exit policy: ai-proxy`
- **THEN** the proxy MAY occupy intake and contract-approval checkpoints to complete Design-checked; Launch remains a present-human instruction and the proxy MUST NOT fire it

## MODIFIED Requirements

### Requirement: 长跑前置需求对齐

The system SHALL perform a **deep intake interview** and output-contract alignment before starting a goal long-run, following `intake-interview-discipline` §A: fog-bounded depth (destination → decision tickets resolved one-per-turn per `clarifying-question-discipline` → approach comparison with human pick → freeze into the output contract → bounded pre-launch self-review). The host MUST NOT restate the composed disciplines' rules in the stage body; it MUST keep only thin touchpoints (pointer, per-turn quantity, Red Flags). When the queue-child predicate holds (this turn's dispatch message already supplied a frozen task card as stage 1 input), that artifact's frozen decisions answer this stage; if that card has no frozen decisions, the interview runs in self-answer mode with every answer flagged as an assumption. Standalone invocations MUST NOT complete Design-checked via self-answer: absent a human-seat confirmation of stages 1–3 and Stage 4 launch approval, Design-checked is incomplete and Launch MUST be refused.

#### Scenario: 产出需求对齐清单

- **WHEN** 用户触发 goal 长跑（如「goal 长跑 xxx」「一个 goal 下去跑 xxx」）
- **THEN** 系统通过一次一问问清目标与开放决策，给出 2–5 方案对比由人选定，产出含冻结决策块（选定方向/已决票/延后票/初始假设）的需求对齐清单（模板1），并完成发射前 checklist 级自审；遗留阻塞性疑点在发射前当面退回给人

#### Scenario: Host does not restate clarifying priority checklist

- **WHEN** an agent reads `goal-driven-workflow` stage 1 instructions for asking clarifying questions
- **THEN** the stage body points at `clarifying-question-discipline` / `intake-interview-discipline` for question selection and graduation rules and MUST NOT embed the purpose→constraints→success priority chain as host-local methodology

#### Scenario: 无人值守 intake 自答降级

- **WHEN** the queue-child predicate holds and the supplied card has no frozen decisions
- **THEN** 系统以自答模式跑访谈（调查 → 保守默认 → 全部标记为假设），访谈在人回归时经台账复核补足

#### Scenario: Standalone absence does not self-answer Design-checked

- **WHEN** a standalone invocation has no human present and Design-checked is incomplete
- **THEN** the system MUST NOT mark stages 1–4 complete via self-answer and MUST refuse Launch

### Requirement: 长跑启动批准门控

The system SHALL require confirmation of the final goal condition + budget + companion checklist before a **standalone** run may enter Armed. The host MUST thin-reference `design-approval-gate` for the approval-gate pattern. That approval MUST NOT start Stage 4 execute; Launch remains a separate explicit user instruction (see Standalone pre-run Design-checked Armed Launch). Auto mode does **not** bypass this standalone launch-approval pause (intentional host divergence from generic auto escape). High-impact conditions (unattended / large budget / irreversible) remain covered by this same pause — they do not create a second, bundled fire-on-approve step.

Queue-child runs (dispatch text already supplied a frozen task card as stage 1 input) use that card's recorded approval as the 留痕 for this gate; they do not wait for a second standalone Armed pause.

#### Scenario: High-impact long run approved

- **WHEN** a standalone long run meets any high-impact condition (unattended / large budget / irreversible)
- **THEN** the system pauses for confirmation of the final goal condition + budget + companion checklist even in auto mode, records Armed on approval, and MUST NOT start the long run until an explicit launch instruction

#### Scenario: Ordinary standalone still needs launch approval

- **WHEN** a standalone long run is low-impact (small budget / reversible / single-file high-certainty)
- **THEN** the system still requires Stage 4 launch approval to enter Armed and MUST NOT start after prior stage confirms alone

#### Scenario: Queue-child card approval stands in

- **WHEN** this turn's dispatch text already supplied a frozen task card that records approval of condition + budget
- **THEN** that recorded approval is the 留痕 for this gate; the child follows `Stage-exit policy` and MUST NOT insert an extra standalone Armed wait

### Requirement: Goal-run SHALL strong-depend on design-approval-gate for launch approval

`goal-driven-workflow` MUST declare `design-approval-gate` in frontmatter `dependencies`, verify it at startup, and thin-reference it at the standalone Stage 4 launch-approval pause (the pause that enters Armed). On standalone invocations, `design-approval-gate`'s generic auto-mode escape MUST NOT skip that pause. High-impact launches (unattended / over-budget / irreversible) remain covered by the same pause. Queue-child runs use the supplying card's recorded approval as 留痕 and do not take this standalone pause.

#### Scenario: Launch gate thin-refs design-approval-gate

- **WHEN** a standalone run reaches Stage 4 launch approval (high-impact or ordinary)
- **THEN** the host loads `design-approval-gate` and still requires confirmation of condition + budget + companion even under auto mode; approval enters Armed and MUST NOT start the harness

### Requirement: goal-run 代理检查点接线

`goal-driven-workflow` SHALL declare `ai-proxy-discipline` in frontmatter `dependencies` (prerequisite check with install guidance; abort on missing when the run contract's Stage-exit policy is `proxy`) and wire it, when the launch contract records `Stage-exit policy: ai-proxy`, at these thin-pointer checkpoints: intake Q&A (stage 1, absent human), contract approval as bounded pre-authorization (**Arm, not Launch**), and the completion-report verification checklist check (stage 5). Checkpoint invocations count against the run budget; between checkpoints the §B ladder governs. With any other policy value or none, stage behavior is identical to today except where Standalone pre-run Design-checked Armed Launch applies. The proxy MUST NOT issue Launch.

#### Scenario: 缺席深谈由代理应答

- **WHEN** 无人值守 goal 长跑 Stage-exit policy: ai-proxy 且 stage 1 无真人在场
- **THEN** intake 逐决策提问由代理按章程应答，决策入账本标记 proxy-made，冻结契约照常产出

#### Scenario: 完成报告受质询

- **WHEN** stage 5 完成报告产出且 policy 为 proxy
- **THEN** 报告的分项核对清单交代理以盲上下文质询（证据标签裁决），未通过项打回重验或出票

#### Scenario: Contract approval Arms only

- **WHEN** the proxy grants contract approval on a standalone invocation
- **THEN** the run enters Armed and MUST NOT start Stage 4 execute until a present-human launch instruction

### Requirement: goal-run 阶段出口策略映射

When dispatched as a queue child (dispatch text already supplied a frozen task card as stage 1 input) or launched with the field in its contract, `goal-driven-workflow` SHALL honor `Stage-exit policy` uniformly with the PDCA engines for **who answers mid-run questions**: `manual` → pause for the present user; `proxy` → auto mode with enumerated proxy checkpoints; `auto` → auto mode with named escapes + §B ladder. No field → legacy trigger-word propagation.

On **standalone** invocations, that field MUST NOT skip stages 1–3 confirmation, MUST NOT skip the Stage 4 launch-approval pause, and MUST NOT count as a Launch instruction.

#### Scenario: 三引擎同语义

- **WHEN** 队列以同一 Stage-exit policy 值派发 goal-driven-workflow / solve-workflow / opsx-solve-workflow 三种子运行
- **THEN** 三者对「运行期间谁回答问题」的处理语义一致（manual 停等真人 / proxy 代理坐席 / auto 具名逃逸），差异仅在各自的检查点/出口形状

#### Scenario: Standalone auto policy does not skip the pre-run gate

- **WHEN** a standalone invocation records `Stage-exit policy: auto` (or the user said 「自动跑」)
- **THEN** the policy selects auto-mode mid-run answering only; Design-checked and explicit Launch still apply
