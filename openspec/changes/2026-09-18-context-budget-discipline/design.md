# Design: context-budget-discipline

## D1 — Shared discipline skill, not per-engine duplication

One `user-invocable: false` skill (`context-budget-discipline`) single-sources the threshold table, ledger format, phase→boundary map and recovery rules. Precedent: `analysis-core` single-sources analysis methodology across the four solve-family hosts (workflow-contract-sync: 「分析阶段核心方法论内容 SHALL 单源承载」). Five inline copies would drift within weeks; the incident evidence (two engines with zero coverage, one with vocabulary only) is exactly what drift produces. Naming follows `skill-naming`: hard rules → `-discipline`, kebab-case, no `opsx-` prefix (not an OpenSpec host itself).

## D2 — Dependency direction: host-to-callee; queue excluded

Per `skill-dependency-direction`: dependencies are declared on the referencing host's frontmatter (host→callee single direction); the callee MUST NOT enumerate hosts. The five engines add the dependency; **`goal-driven-queue` does not** — its card supply reaches engines whose own stage-0 prerequisite checks already abort on a missing discipline, so a queue-level duplicate gate adds nothing. The queue keeps one supply sentence only.

## D3 — Proactive threshold: ~60–70% of the window, platform-agnostic wording

Reactive near-limit compaction is too late: the incident sessions averaged ~215K/turn — the window was paid for ~1000 times over. The discipline sets default guidance "evaluate reset when measured or projected context approaches ~60–70% of the context window", recoverable at the next safe boundary with a recorded miss note when a threshold is crossed mid-phase. Wording stays intent-level ("summarize state to the ledger, then reopen a compact session") — no platform-specific compaction commands (铁律 6).

## D4 — Ledger: atomic write-then-reset handoff

Before any reset or compaction the run writes a complete ledger entry (format in the discipline's `reference.md`): frozen decisions, decisions-so-far with evidence pointers, artifact paths, current phase, next concrete step, open tickets. A resumed session reconstructs state from ledger + referenced artifacts, never by replaying conversation history. Reset without a preceding complete ledger entry is a violation. Integration: `jira-fix-workflow`'s existing `--resume` checkpoint path reads the ledger instead of a bare stage marker. Hosts hold one-line pointers only — the format never leaves the discipline (D1).

## D5 — Hooks as sub-steps inside existing integer stages

`workflow-contract-sync` prohibits decimal stage numbers. Hooks land as entry sub-steps: `jira-fix-workflow` stages 7/8/9 (implement/verify/report), `opsx-jira-fix-workflow` stages 7/8, `solve-workflow`/`opsx-solve-workflow` execute/verify entries, `goal-driven-workflow` planning at stage 3 + checks on the stage-4 budget-milestone cadence (`长跑运行中自检节奏`).

## D6 — No queue card field; enforcement unconditional

The incident happened with no opt-in surface; a `Context-budget: on/off` field would add a decision burden per card with no use case for "off". Enforcement is unconditional for all engine runs; the Delegate card supply carries exactly one sentence noting the engine enforces its own context budget. `goal-queue` requirement 「编排层薄引用引擎方法论」 stays satisfied — one sentence is supply metadata, not methodology restatement.

## D7 — solve-workflow spec gap: cross-cutting contract lands in workflow-contract-sync

`solve-workflow` and `opsx-solve-workflow` have no `openspec/specs/` directories; minting new spec capabilities for them is out of scope. The four solve-family hosts share one cross-cutting requirement in `workflow-contract-sync` (the spec that already owns their shared contracts). `goal-run` hosts are covered by their own delta. `jira-fix-workflow` / `opsx-jira-fix-workflow` spec files stay untouched — their obligation flows through the workflow-contract-sync requirement, minimizing blast radius.
