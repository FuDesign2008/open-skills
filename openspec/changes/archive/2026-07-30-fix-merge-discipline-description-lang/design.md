## Context

Lean wording fix for `merge-discipline` description; behavior unchanged.

## Goals / Non-Goals

**Goals:** Apply solution 2 English-primary description; keep full Chinese trigger set; stay ≤1024 chars.

**Non-Goals:** Rewriting SKILL body; changing Part A–D behavior.

## Decisions

Use the solution-2 string as-is (Hard gate… A→B→C→R→D… Do NOT… Triggers — …).

## Risks / Trade-offs

- [Index/description lint] → Mitigation: run `lint:skill-description` + regen skills-index.
