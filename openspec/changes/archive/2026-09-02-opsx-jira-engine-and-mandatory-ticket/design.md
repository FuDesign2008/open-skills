# Design: opsx-jira engine + mandatory engine ticket

## Context

Executed as a goal-driven-batch queue child (Engine: opsx-solve-workflow, Stage-exit policy: ai-proxy) — this very change dogfoods the queue system built today. The frozen approach comes from the host solve-workflow's reviewed stage-3/4/5 artifacts.

## Goals / Non-Goals

**Goals:** five-engine symmetry; engine choice always conscious (no silent default); opsx-jira children archive natively and terminate at PR-open; independent opsx-jira-fix use unchanged.

**Non-Goals:** changing any engine's own semantics beyond the Queue-child section; auto-choosing engines by task shape (guidance + recommendation only, human decides); batching.

## Decisions

1. **No default anywhere** (user mandate): new cards always carry Engine (mandatory ticket); field-less cards park with a one-line fix note — honest failure over silent mis-dispatch. The old "absent = default" scenario is replaced in the delta with an explicit record of the intentional change.
2. **Archive always happens for opsx-jira children**: unlike jira-fix (which defers nothing archive-related because it has no archive), the opsx twin's reason-for-being is sedimentation — so its PR-open terminal preserves archive and defers only merge + writeback, isomorphic to merge-discipline Part A (archive-before-merge).
3. **Ticket order**: interaction budget first, engine second — the budget shapes who answers at exits; the engine shapes what runs; both precede scope tickets.
4. **Symmetric thin wiring** per the jira-fix precedent; explicit `queue-child` flag only.

## Risks / Trade-offs

- [Five-way choice burden] → fit guidance + recommended answer in the ticket; still one structured question.
- [opsx-jira-fix iterates fast] → single self-contained section; contract greps.
- [Field-less backlogs break] → park carries the one-line fix in the note; migration cost is a single field per card.

## Migration Plan

No default removal for running children — only intake behavior changes. Rollback = revert.

## Open Questions

None.
