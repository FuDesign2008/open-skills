# Design

## Context

`architect` is on main. Hosts still hardcode subordinate dispatch. Frozen plan: meta-role `leader`, keep existing ids, add craft roles, thin hosts to call `leader`.

## Goals / Non-Goals

**Goals:**
- `leader` as sole host-facing dispatcher for opted-in phases
- Full subordinate catalog with skill-backed write boundaries
- Presence guard unchanged for no-contract hosts

**Non-Goals:**
- Renaming `developer` / `tester` / `code-reviewer` / `architect`
- Making `leader` merge protected branches
- Fully converting every PDCA stage to leader on day one (clarify/implement/release/retrospect remain available via Phase when hosts opt in later)

## Decisions

1. Hosts pass `Phase`; contract owns default subordinate sets and gates.
2. Design + verify wired now on the four hosts (jira verify via Stage 8; solve/opsx-solve Stage 7).
3. Nested cards must be fail-closed by `leader` before host acceptance.
4. New roles are thin agent files pointing at existing skills.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Hosts forget nested acceptance | Leader MUST surface nested Verdicts; host accepts leader card |
| Over-dispatch on small fixes | Gates keep architect/security/perf optional |
| Catalog drift | Single catalog table in `_contract.md` |
