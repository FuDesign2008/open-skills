---
name: parallel-delegation-discipline
version: "1.0.0"
user-invocable: false
description: "Hard discipline for deciding when work may run in parallel and how parallel results are collected: a verifiable admission test (no dependency edge, disjoint write sets, distinct artifact sinks, 3-5 units, no gated item), four composition modes, bounded returns, fail-closed collection, write isolation through git-worktree-discipline, a serial reservation list, and a cost posture. Referenced by PDCA hosts via frontmatter dependencies; not a scheduler (goal-driven-queue owns slot dispatch). Triggers — 「并行执行」「并行委派」「子代理并行」「多代理并行」「能不能并行」 / parallel delegation, subagent parallelism, concurrent agents, when to parallelize. Do NOT use as a standalone task workflow, a queue scheduler, or a context-budget replacement."
dependencies: []
---

# Parallel Delegation Discipline

> Internal shared skill. Single source of truth for **when independent work may run in parallel, how it is split, what comes back, and what must stay serial**. Hosts declare it in `dependencies` and thin-reference it at their parallel-capable stages; they keep their own stage numbers, exits, and artifact sinks.

## Iron Law

**Only units that are independent and have disjoint write sets may run in parallel — and parallelism changes no stage order, no gate, no write ownership, and no evidence responsibility.**

## Admission test

Admit a unit set to parallel execution only when every condition holds. Each condition resolves from an artifact, a command, or a path set; a set that has to be judged "looks independent" is not admitted.

| # | Condition | How it is resolved |
|---|---|---|
| 1 | No dependency edge | The plan or task list has no `Depends-on` relationship between admitted units |
| 2 | Disjoint write sets | Every writing unit declares `Writes:` as a path or module list; the pairwise intersection is empty |
| 3 | Distinct artifact sinks | Each unit writes its own artifact path; no two units target the same file |
| 4 | Unit count 3–5 | Count the units; fewer than 3 run serially, more than 5 need a stated reason |
| 5 | No gated item | No admitted unit is a gate, an approval, a stage transition, an item on the serial reservation list, or a unit whose dependency on another admitted unit is unresolved |

When a condition fails, run the set serially and say which condition failed. Admission never overrides a host's own stage restriction: a stage that forbids business-code writes keeps that restriction even when the units look parallel-safe.

## Composition modes

Name the mode and the split basis in the stage output; the collection step depends on knowing what it is merging.

| Mode | Use when | Split basis | Collection implication |
|---|---|---|---|
| **Sectioning** | One decomposition yields independent subtasks (modules, files, checks) | The decomposition itself | Merge by domain; no cross-unit ranking |
| **Voting** | The same object needs independent judgement (review axes, adversarial checks) | Perspective or axis | Keep units blind to each other's framing; never merge into one ranked list |
| **Orchestrator-workers** | Subtasks are only known at run time (research, batch triage) | Decided by the orchestrator as it goes | Return findings, not a plan; the host decides the next split |
| **Pipeline** | Stages have declared dependencies but adjacent stages can overlap | Stage boundary | Respect the declared order; overlap never advances a gate early |

## Delegation contract

Each unit's instruction is self-contained: task, allowed scope, expected artifact, and what to return. A unit is never assumed to inherit the host session's history — construct exactly what it needs.

A unit returns a bounded summary, not its working transcript: the conclusion, at least one evidence reference (a command with an output summary, or a file-and-line reference), the artifact path, and any unresolved item. `context-budget-discipline` owns the size bound and the re-compression duty; when a unit returns more than its contract allows, ask for a condensed summary instead of ingesting the dump.

When the project provides a role contract (`agent-role-separation`; default `.claude/agents/_contract.md`), that contract's task card, result card, fail-closed acceptance, and write boundaries are authoritative. Use its fields and acceptance rules, and leave this discipline to supply only the parallel admission and collection layer.

## Collection duty

A unit's self-report is an unverified claim. Before the results support a stage exit:

1. Check the reported artifacts against the declared write sets; two units touching the same path is a conflict — stop merging those results and re-run the affected work serially.
2. Apply the fresh-evidence rule from `completion-evidence-discipline`: prior-turn memory, a designed-but-unrun check, or a unit's success text alone is not evidence.
3. Keep failure local: one unit's failure or block does not cancel its siblings; record it and let the rest finish.

A parallel result set never satisfies a stage gate on its own; the host's own gate still runs.

## Serial reservation

These stay single-threaded regardless of the admission test:

- Stage transitions and stage exits
- Approval gates and every human checkpoint
- Merges, releases, and protected-branch operations
- Jira status transitions and writeback
- Writes to a shared file or a shared OpenSpec change
- The final cross-axis verdict and evidence acceptance

Parallel work may prepare inputs for a reserved item; it never pre-approves, reorders, or skips it.

## Write isolation and disclosure

Reading units may run without isolation. Writing units each run in their own isolated workspace created through `git-worktree-discipline`; this discipline does not define worktree steps and does not create a second isolation mechanism.

Before the units start, state the parallel plan — unit count, split basis, and each unit's write set or isolated workspace — inside the stage-confirmation output the host already produces. No extra pause and no extra approval event are introduced.

The user keeps a serial override: a stated request to run serially makes this run serial, and the run records the override with its reason.

## Cost and scale

Parallelism trades tokens for wall-clock; it is not cheaper. Published baselines put a multi-agent system at roughly 15× the token cost of a chat, and coding work has fewer truly parallelizable units than research. Default to 3–5 units, prefer read-only stages, and state the reason when a larger set is proposed.

## Boundaries

| Adjacent skill | Owns | This discipline |
|---|---|---|
| `context-budget-discipline` | Summary bound, compaction threshold, ledger | References the bound; does not restate numbers |
| `git-worktree-discipline` | Workspace creation and cleanup | Requires isolation for writing units; does not define the procedure |
| `completion-evidence-discipline` | Fresh-evidence acceptance | Applies it at collection; does not restate the rule |
| `agent-role-separation` | Task card, result card, fail-closed acceptance, role write boundaries | Uses it when present; supplies only the parallel layer |
| `goal-driven-queue` | Card-level slot dispatch, module-set admission, caps | Does not schedule; no slots, queues, watchdogs, or background processes |

## Integration guide

Hosts that reference this discipline:

1. Declare it in frontmatter `dependencies` and run the normal prerequisite check — a missing discipline aborts with install guidance, never a silent serial fallback.
2. Add at most one pointer per parallel-capable stage (analysis, review, verification), phrased as load-and-apply.
3. Put the parallel-plan announcement in the stage output the host already produces; do not add a pause or an approval event.
4. Keep the host's serial reservations explicit where they differ (Jira writes, OpenSpec artifact writes, Stage-8 role dependency edges).
5. Leave the admission conditions, mode names, return fields, and reservation list here — hosts do not restate them.
