## Why

The repository's four PDCA/Jira hosts (`solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, `opsx-jira-fix-workflow`) carry **zero** sub-agent or parallel instructions: a repository-wide count of `sub-?agent|parallel` across their `SKILL.md` and `reference.md` returns 0 for every host. The hosts therefore execute analysis, review, and verification strictly serially, even where the work units are independent read-only tasks with no shared write set.

The root cause is not missing platform capability (the platform supports concurrent sub-agents and isolated contexts) but a **gap in the skill layer**: 铁律 6 forbids naming platform-specific tools, and the authors answered that constraint by omitting parallelism entirely rather than describing the intent. The only parallel-permitting sentence in the repository (`staged-review-flow`: the two review axes "MAY run in parallel") is never reinforced by a host.

Parallelism is now worth expressing because the material cost and the safety conditions are both known: Anthropic's published engineering data puts multi-agent systems at roughly 15× the token cost of a chat (agents alone are ~4×), identifies 3–5 parallel workers as the practical sweet spot, and explicitly notes that coding work has **fewer** truly parallelizable units than research. Parallelism therefore pays only under an admission test, not as a default posture.

## What Changes

- Add a new shared discipline `parallel-delegation-discipline` (`user-invocable: false`) that single-sources: the parallelism admission test (dependency independence, disjoint write sets, unique artifact paths, cost threshold), the four composition modes (sectioning / voting / orchestrator-workers / pipeline), the bounded-return contract, the collection-and-verification duty, and the **serial reservation list** (gate order, approvals, merges, releases, Jira writeback, shared-file writes, cross-axis verdicts).
- Declare the new discipline as a **strong dependency** of all four hosts, with the repository's standard prerequisite check (missing → abort with install guidance).
- Wire one thin pointer per host at the stages where independent units exist: the analysis stage, the review stage, and the verification stage. Hosts keep their stage numbers, exits, artifact sinks, and existing divergences; they do not restate the discipline's method.
- Hosts **announce** the parallel plan (unit count, split basis, per-unit write set or worktree) inside the existing stage-confirmation output — no new pause, no new approval event.
- Parallel execution changes no stage order, no gate, no human checkpoint, no merge/release/Jira-writeback authority, and no evidence-responsibility assignment.
- Compose with the existing `agent-role-separation` contract rather than competing with it: when a project provides a role contract, its task card, result card, and fail-closed acceptance rules are authoritative, and the new discipline references them instead of restating their fields. When no role contract exists, the discipline's generic bounded-return contract applies.
- Constrain `jira-fix-workflow` Stage 8's role dispatch (8a standard review, 8b escalated review, 8c integration test) so that the permanent dependency 8a → 8b stays serial and only the independent units may be admitted to parallel execution.
- Remain declarative: no runtime slots, watchdogs, schedulers, or background-process mechanics (those stay in the host adapter layer per `docs/super-agent-essence-analysis.md` § 7).
- Update the repository skill registry (`AGENTS.md` dependency columns) and the generated skills index.
- **BREAKING**: none. Every existing serial path remains valid; a run that never selects parallelism behaves exactly as today.

## Capabilities

### New Capabilities

- `parallel-delegation-discipline`: the admission test for parallelism, the composition modes, the bounded return contract, the collection/verification duty, the serial reservation list, and the cost guardrails — referenced by hosts through a thin pointer.
- `solve-workflow`: this host has no spec directory today; the change introduces one limited to the parallelism wiring requirement (strong dependency + stage pointers + announced parallel plan), so all four hosts carry the same contract.

### Modified Capabilities

- `opsx-solve-workflow`: adds a requirement that the workflow declare the discipline as a strong dependency and thin-reference it at analysis, review, and verification, announcing the parallel plan at the existing stage confirmations without changing stage order or exits.
- `jira-fix-workflow`: same addition, plus the constraint that Jira status transitions and writeback stay in the serial reservation list.
- `opsx-jira-fix-workflow`: same addition, plus the constraint that OpenSpec artifact writes and Jira status transitions stay serial.
- `staged-review-flow`: the dual-axis sentence is strengthened from an unenforced "MAY" to an explicit delegation to `parallel-delegation-discipline` for the admission test and bounded-return contract, so hosts have a single authoritative source instead of a permissive aside.

## Impact

- **New files**: `skills/parallel-delegation-discipline/SKILL.md` (and `reference.md` if the prompt/summary templates exceed the SKILL.md budget).
- **Modified skills**: `skills/solve-workflow/SKILL.md`, `skills/opsx-solve-workflow/SKILL.md`, `skills/jira-fix-workflow/SKILL.md`, `skills/opsx-jira-fix-workflow/SKILL.md` — frontmatter `dependencies` plus one pointer line per affected stage; `skills/staged-review-flow/SKILL.md` — one sentence rewording.
- **Registry**: `AGENTS.md` skill dependency table; `docs/generated/skills-index.md` regenerated by `scripts/gen-skill-docs.mjs`.
- **Behavior**: identical for any run that selects no parallelism. When parallelism is selected, wall-clock tends to drop while token cost rises (published baseline ~15× vs chat), and sub-agent output is treated as unverified until the host re-checks evidence.
- **Non-goals**: no change to merge, release, protected branches, Jira writeback, or `goal-driven-queue`'s card-level concurrency (that skill keeps owning slot dispatch); no new user-facing trigger is required to enable parallelism, and a serial escape remains available to the user.
