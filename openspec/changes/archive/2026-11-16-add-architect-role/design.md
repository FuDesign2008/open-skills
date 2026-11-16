# Design

## Context

`.claude/agents/` already has `developer`, `code-reviewer`, `tester`, plus `_contract.md` and `models.json`. Only `jira-fix-workflow` Stage 8 dispatches roles today. This change extends the same catalog and presence-guard pattern into design phase without replacing existing roles.

## Goals / Non-Goals

**Goals:**
- Add `architect` with design-doc write boundary and default `escalated` tier
- Auto-dispatch after solution selection / before solution review when contract + gate
- Keep manual dispatch available
- Wire all four PDCA hosts with thin hooks mirroring Stage 8 style

**Non-Goals:**
- New shared dispatch skill (Solution 2 deferred)
- Changing Stage 8 reviewer/tester semantics
- Distributing `.claude/agents/` via `npx skills`
- Replacing organizer when the architecture gate does not fire

## Decisions

1. **Extend catalog, do not replace** — new `architect.md`; keep the three existing role files.
2. **Write boundary B** — design docs only; organizer diffs against `Artifacts`.
3. **Default path** — task-card `Artifacts`; else `openspec/changes/<name>/design.md` when a change exists.
4. **Gate = explicit ∨ verifiable** — no estimated-file-count or AI preference inputs (铁律 10).
5. **Host placement** — solve/opsx-solve: between Stage 3 pick and Stage 4 review; jira/opsx-jira: after solution pick inside explore/review, before `staged-review-flow`.
6. **Presence guard** — no `_contract.md` → no dispatch (verification and design phases independently).
7. **Thin host prose** — same shape as Stage 8 Role dispatch block; gate signal list lives in `_contract.md` as SoT, hosts point at it.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Four host hooks drift | Shared paragraph template; contract owns gate list |
| False-positive keyword gate | Require whole-word / listed phrases; prefer explicit mark when ambiguous |
| `architect` overwrites design.md mid-review | Dispatch before review; review consumes the artifact |
| opsx Phase 4 also creates design.md via continue-change | When architect ran, organizer uses/merges that artifact rather than blank-rewrite; document in host hook |

## Open Questions

- None remaining from clarification; keyword list may be extended later without changing gate shape.
