# Design: jira-fix engine integration

## Context

The pre-analysis identified four jira-fix-specific problems on top of the five generic leak root causes: no policy wiring, stage-10 merge confirmation stalling unattended runs, writeback as a reserved outbound, and no card→intake supply. The user chose integration-with-fixes over routing to jira-fix-batch.

## Goals / Non-Goals

**Goals:** jira-fix as a fourth engine with genuine unattended capability; every identified problem fixed by contract, not workaround; independent jira-fix use byte-identical.

**Non-Goals:** `opsx-jira-fix-workflow` integration (future symmetric change); counterpart authority over merges or Jira writeback (reserved, permanently human); changing jira-fix's difficulty grading or checkpoint/resume machinery.

## Decisions

1. **PR-open terminal instead of unattended merge.** Two independent contracts force it: the queue's "merge authority is exclusively human" red line and jira-fix's own "both auto and manual require user confirmation before merging". Deferring stage 10 converts a guaranteed stall into the queue's native pattern (branches awaiting human review — identical to goal-run/solve children whose PRs also await humans). Writeback follows the merge by necessity (it is post-merge in jira-fix's own SOP), so deferral resolves both P3 and P4 with one decision.
2. **Explicit `queue-child` flag, never guessed** (review C1): the short-circuit activates only when the dispatch invocation carries the flag; jira-fix never infers queue context from ambient signals — this keeps the high-frequency-iteration skill's standalone semantics untouched.
3. **Supply mapping reuses the frozen contract**: Jira link in the goal condition, frozen decisions as stage 0–1 answers; difficulty grading stays jira-fix's own call — a 🔴 termination is a normal non-blocking failure in queue terms.
4. **Symmetric thin wiring** (same as solve/opsx): one Queue-child-mode section, ai-counterpart dependency with opt-in-only abort, forecast at start, counterpart exits only under `Stage-exit policy: counterpart`.
5. **Stacked on feat/stage-exit-policy** (depends on its policy semantics); PR base = that branch, auto-retargeted after #298 merges.

## Risks / Trade-offs

- [jira-fix iterates fast, thin section rots] → single self-contained insertion, no restated methodology; contract greps cover the terms.
- [Writeback limbo if the human never merges] → acceptance package lists merge+writeback as explicit pending follow-ups (visible, not silent).
- [User expects full end-to-end including merge from the queue] → documented trade: merge stays human by red line; the queue's value is fix-through-PR while away.

## Migration Plan

Default engines unchanged; no card field = today's behavior. Rollback = revert.

## Open Questions

None.
