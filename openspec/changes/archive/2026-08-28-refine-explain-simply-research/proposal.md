# Proposal: refine explain-simply from external research

## Why

An external research pass (2026-08-28) compared the freshly renamed `explain-simply` skill against four established frameworks — the Feynman Technique (fs.blog), Made to Stick / Curse of Knowledge (Heath brothers, 2007), Dual Coding Theory (Paivio, 1971), and Gentner's structure-mapping theory of analogy (1983). Verdict: content and strategy are aligned, with no structural errors, but four one-line refinements would ground the skill's method in the researched sources and close two edge-case gaps surfaced by the review.

## What Changes

- SKILL.md **Design root** names the enemy: the Curse of Knowledge (Heath & Heath, *Made to Stick*, 2007) — the research-backed reason this skill exists
- SKILL.md **Fidelity criterion** adds Gentner's structure-mapping guidance: build analogies on relational structure, not surface similarity (Gentner, 1983) — construction guidance, complementing the existing check-only rule
- SKILL.md **Evidence rule** adds the final fallback: when even a canonical public example is unavailable, ground the concrete-shape step in definition + why-it-exists, labeled as having no concrete example
- SKILL.md **Output format** defines the narrow-question criterion: one a single fact answers
- Description unchanged (routing surface stable)

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `explain-simply`: Requirement "explain-simply evidence SHALL be authentic" gains an explicit MUST fallback when no canonical public example exists (the current text stops at the labeled-public-example case)

## Impact

- `skills/explain-simply/SKILL.md` (4 one-line insertions), `openspec/specs/explain-simply/spec.md` (requirement 2 MODIFIED via archive sync)
- No routing/trigger changes; no code; rides PR #289 as a follow-up commit on the same branch
