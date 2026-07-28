## Context

Three-way research (open-skills × Superpowers × Matt Pocock skills) selected first-wave upgrades M1/S1/M2/M3 under solution B: thin shared contracts + host thin refs. New skill MUST NOT collide with external repo names — use `completion-evidence-discipline` instead of Superpowers' `verification-before-completion`.

## Goals / Non-Goals

**Goals:**
- M1: clarifying questions carry recommended answers; fact self-check vs decision ask-human
- S1: new `completion-evidence-discipline` for fresh-evidence completion claims
- M2: pdca-review dual-axis Standards ∥ Spec
- M3: analysis-core red-capable loop before hypotheses
- Thin pointers from solve / opsx-solve / jira-fix / opsx-jira-fix as needed

**Non-Goals:**
- Re-adding Superpowers dependency; copying Matt skill names
- S2 design HARD-GATE, TDD skill, wayfinder, worktrees, SessionStart bootstrap (later waves)

## Decisions

1. **New skill name** = `completion-evidence-discipline` (matches `*-discipline` family; collision-free).
2. **Enhance in place** for clarifying / pdca-review / analysis-core rather than parallel skills.
3. **Hosts**: add dependency + one-line pointer where stage 7 / clarifying / analysis already thin-ref shared skills; avoid large host rewrites.
4. **Language**: English bodies; Chinese triggers in descriptions; platform-agnostic intents.

### Stage 4 review — Pass (user confirmed; auto mode)

## Risks / Trade-offs

- [Host miss thin-ref] → Checklist in tasks for four hosts
- [Name drift] → Grep forbid `verification-before-completion` as skill name in this repo
- [Over-strict red loop on pure static bugs] → Allow stating why loop cannot be established; still block multi-hypothesis guessing

## Migration Plan

Implement skills → lint descriptions → openspec validate → light smoke → user confirms archive/PR.

## Open Questions

None blocking.
