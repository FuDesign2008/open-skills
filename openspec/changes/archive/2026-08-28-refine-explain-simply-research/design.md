# Design: refine explain-simply from external research

## Context

External research (2026-08-28; sources cited inline in the skill body) validated the skill's direction and surfaced four refinements. All are one-line insertions placed at their single correct location per the repo's write-once rule.

## Goals / Non-Goals

**Goals:** land the four researched refinements (Curse of Knowledge naming, structure-mapping guidance, evidence fallback, narrow-question criterion) with citation hygiene and unchanged routing.

**Non-Goals:** description/trigger changes; requirement changes beyond evidence authenticity; visual-aids changes (Dual Coding Theory already validates the existing rule).

## Decisions

1. **Curse of Knowledge goes in Design root** — it is the why, not a method step; one sentence with the book citation, positive framing (names what the skill fights, per the positive-prose rule).
2. **Gentner line goes in the Fidelity criterion section** — complements the existing check with construction guidance ("map relations, not surfaces"); requirement 3's contract (constraints preserved) is unchanged, so no spec delta.
3. **Evidence fallback changes requirement 2** — the MUST-level fallback needs the behavioral contract updated, hence the MODIFIED delta with a full block copy plus one new scenario.
4. **Narrow-question criterion goes in the Output format paragraph** — it calibrates an existing sentence; a question a single fact answers is narrow.
5. **Citations follow the Design root pattern** — inline author/work/year (Heath & Heath 2007; Gentner 1983), verified against official or multi-source references this session.

## Risks / Trade-offs

- [Citation drift] → sources are established works (2007 book, 1983 paper), stable by nature
- [Spec/body divergence] → archive sync merges the MODIFIED requirement; body prose edited in the same commit

## Migration Plan

Same branch as PR #289; single follow-up commit; archive inside the branch before commit.

## Open Questions

None.
