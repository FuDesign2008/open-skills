## Context

In-repo `clarifying-question-discipline` is the unconditional clarifying primitive for PDCA hosts. External `grilling` / `brainstorming` feel stronger but must not become strong dependencies (install split; prior remove-superpowers-integration). Solution B: rewrite the shared skill body in grilling density; keep skill id and host `dependencies`.

## Goals / Non-Goals

**Goals:**
- Grilling-force questioning: decision tree, relentless one-at-a-time, recommended answers, shared-understanding gate.
- Absorb brainstorming essentials only: context-before-ask, scope decompose when multi-subsystem.
- Preserve platform-agnostic question shape and three host touchpoints.
- Sync OpenSpec main capability requirements.

**Non-Goals:**
- Delete skill or rename to `grilling` / `brainstorming`.
- Strong-depend on external mattpocock/superpowers skills.
- Port Visual Companion, design-doc writing, or full brainstorming checklist into this discipline.
- Mass-edit host SKILL bodies beyond thin pointer compatibility.

## Decisions

1. **Keep skill id `clarifying-question-discipline`** — avoids cross-host migration; name stays discipline-role accurate.
   - Alternative rejected: vendor new `grilling` + hard-cut deps (higher cost; user chose B).
2. **Whole-file rewrite, not patch stack** — grilling density is the product; long bureaucratic sections diluted force.
3. **Open-ended allowed** — structured+recommend remains default; open-ended when options fake certainty (from brainstorming).
4. **Shared-understanding gate** — mirrors grilling "do not act until confirm"; aligns with clarify-first and design-approval-gate without renaming to brainstorming.
5. **Opsx change `rewrite-clarifying-grilling-style`** — behavior contract delta + archive path for iron law 5.

## Risks / Trade-offs

- [More aggressive follow-ups] → Mitigation: existing "user asks to proceed early" escape; hosts keep clarify-first slogan.
- [Hosts copy decision-tree into bodies] → Mitigation: integration guide forbids restating full rules; keep three touchpoints only.
- [Description length] → Mitigation: `npm run lint:skill-description` on edit.

## Migration Plan

1. Land SKILL.md v1.3.0 + delta/main spec on feature branch.
2. Archive change after verify (same tip as implementation preferred).
3. Rollback: revert commit; hosts unchanged.

## Open Questions

None for B — user confirmed auto mode.
