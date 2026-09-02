# Proposal: opsx-jira engine + mandatory engine ticket

## Why

Two user decisions: (1) complete the engine symmetry — `opsx-jira-fix-workflow` joins the Engine vocabulary (the last non-goal from the jira-fix integration); (2) engine selection becomes a **mandatory intake ticket with no default** — the user must consciously choose the child executor instead of inheriting a silent `goal-driven-workflow` default.

## What Changes

- **Mandatory engine ticket** (second fixed ticket, after the interaction budget): explicit choice among the five exact skill names with fit guidance and a recommended answer; no default value; `Engine` becomes a required card field. A card without the field (legacy or hand-written) parks at the consumption-entry check as `conflict pending confirmation` (awaiting engine decision) — replaces the previous "absent = goal-driven-workflow default" scenario (intentional contract change, reviewed and user-mandated).
- **Fifth engine value `opsx-jira-fix-workflow`**: invoked like the jira-fix child (Jira-link goal condition, frozen decisions as stage 0–1 supply, explicit `queue-child` flag) plus the openspec environment gate; terminal is **archive + PR-open** — archiving is native to its model and always happens; merge + Jira writeback defer to the human.
- Symmetric wiring: `ai-proxy-discipline` PDCA host list += opsx-jira-fix-workflow; opsx-jira-fix gains the ai-proxy dependency + a Queue-child mode thin section (input supply, Stage-exit policy semantics, ai-proxy exits, stop-point forecast, archive+PR-open terminal on the explicit flag only).

## Capabilities

### New Capabilities
(none)
### Modified Capabilities
- `goal-queue`: 交互预算票（two fixed tickets）+ 子任务引擎可选调度（5 values, mandatory ticket, park-on-absent, opsx-jira terminal）。
- `ai-proxy`: PDCA host list += opsx-jira-fix-workflow.

## Impact

`goal-driven-batch` 0.11.0, `opsx-jira-fix-workflow` 1.19.0, `ai-proxy-discipline` 1.4.0, AGENTS rows, evals +2, index.
