# goal-run Delta: itemized verification + self-check cadence + optional OpenSpec

## MODIFIED Requirements

### Requirement: 完成报告与人工验收

The system SHALL produce a structured completion report after the long run, separate machine-verifiable acceptance (spot-checked by human) from human outcome-level acceptance, and MUST follow `completion-evidence-discipline` for any pass/done claims (fresh current-turn evidence; Executed vs Pending labels). The host MUST thin-reference that skill rather than restating its full iron law. The completion report SHALL carry a numbered **verification checklist** with one line per item: (1) goal achievement vs the restated goal/output contract; (2) frozen-approach comparison — what was frozen, what actually happened, deviations with reasons; (3) tests and verification evidence per acceptance tier (Executed/Pending labels); (4) side effects — functional (unexpected behavior changes elsewhere) and non-functional (performance/security/maintainability impact), each split explicitly; (5) logic and end-to-end flow review for gaps. Checklist items are additive report structure — they do not replace the per-criterion acceptance status.

#### Scenario: Report and layered acceptance

- **WHEN** the long run ends
- **THEN** the main agent outputs the completion report (template 5: goal recap, per-criterion status, deliverables + evidence, leftovers, spend), the human judges outcome-type items and spot-checks machine items; findings feed the next run's requirements template

#### Scenario: Pass claims cite completion-evidence-discipline

- **WHEN** the agent marks hard acceptance items as passed
- **THEN** each pass claim is backed per `completion-evidence-discipline` with Executed evidence or labeled Pending

#### Scenario: 完成报告分项核对清单

- **WHEN** 长跑结束产出完成报告
- **THEN** 报告含编号核对清单（目标达成对照 / 冻结方案对照与偏差 / 分层测试证据 / 副作用功能与非功能分列 / 逻辑端到端复查），每项标注证据状态，无「整体看起来没问题」式的合并结论

## ADDED Requirements

### Requirement: 长跑运行中自检节奏

The system SHALL define a mid-run self-check cadence for the monitor step: at each budget milestone (e.g. every half or third of the turn/time budget), the orchestrating agent re-checks the evaluator's latest reason, remaining budget, and anomalies (repeated failures, no-progress loops), and records one run-log line per milestone. A milestone check that reveals sustained no-progress or budget exhaustion trend triggers the early-interrupt control instead of waiting for the full budget to burn.

#### Scenario: 预算里程碑自检

- **WHEN** 长跑消耗到达一个预算里程碑
- **THEN** 监控步骤记录一行运行日志（评估器最新理由、剩余预算、异常），发现持续无进展趋势时提前走中断控制而非等预算烧完

### Requirement: 可选 OpenSpec 沉淀（goal-run）

The system SHALL offer OpenSpec sedimentation as an **opt-in intake decision** (`traceability: openspec | none`), presented only when the target project has an `openspec/` directory and a usable openspec CLI or equivalent; default is off, project policy (AGENTS.md/CLAUDE.md) may mandate on, and the user's explicit choice wins. When on: stage 2/3 artifacts map to an openspec change under `openspec/changes/<name>/` (proposal = frozen approach + why, design = acceptance layering + sub-agent division, tasks = checkbox checklist maintained during the run); stage 4 carries the change path in the launch contract; stage 5 runs `openspec validate` and archives the change (syncing main specs) once machine-verifiable evidence is complete, recording both as report evidence items. When off or unavailable: behavior is identical to a run without this capability.

#### Scenario: 选择采用 openspec 沉淀

- **WHEN** 目标工程存在 openspec/ 且 CLI 可用，用户在 intake 选择 traceability: openspec
- **THEN** 阶段 2/3 产物映射为 openspec change artifacts，运行中维护 tasks 勾选，完成报告含 validate 结果与归档动作（机器可验证证据齐全后执行）作为证据项

#### Scenario: 未选择则零变化

- **WHEN** 用户未选择 openspec 沉淀（或工程无 openspec/）
- **THEN** 该选项不出现或不生效，全部阶段行为与无此能力时逐字一致

#### Scenario: 归档门控于机器可验证证据

- **WHEN** openspec 沉淀开启且长跑结束
- **THEN** 归档（sync 主 specs）在机器可验证证据齐全后执行；outcome 型判断仍留给人，其发现回流为新/修订的 change 而非阻塞归档
