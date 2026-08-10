## Why

`clarifying-question-discipline` already encodes one-question-per-turn, recommended answers, and fact-vs-decision checks, but agents still feel weaker than mattpocock `grilling` / Superpowers `brainstorming`: mechanical checklist tone, weak decision-tree walking, soft exit before acting. Keep the in-repo skill id (hosts must not strong-depend on external grill-me/brainstorming) and rewrite the body for grilling-density force while preserving host integration touchpoints.

## What Changes

- Rewrite `skills/clarifying-question-discipline/SKILL.md` (v1.3.0) in grilling-style short prose: decision tree, relentless interview, shared-understanding gate, context-before-asking / scope decompose, open-ended allowed.
- Keep: one-per-turn multi-round, recommended answer, fact vs decision, investigation-first, platform-agnostic question shape, three host touchpoints, Chinese triggers.
- **Not** deleting the skill; **not** adding strong deps on external `grill-me` / `brainstorming`.
- Update main capability spec `clarifying-question-discipline` with new requirements (decision tree, shared-understanding gate, context-before-ask).

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `clarifying-question-discipline`: add decision-tree questioning, shared-understanding gate before acting, context/scope explore before burning question slots; allow open-ended questions when fixed options fake certainty; keep existing one-per-turn / recommend / fact-vs-decision / host touchpoints / platform-agnostic rules.

## Impact

- Skill: `skills/clarifying-question-discipline/SKILL.md` (+ generated skills-index via hook).
- Spec: `openspec/specs/clarifying-question-discipline/spec.md`.
- Hosts (`solve-workflow`, `opsx-*`, `jira-fix-*`, `write-workflow`, `goal-driven-workflow`, etc.): no dependency renames; behavior intensifies via shared skill load. Thin pointers unchanged unless wording drifts from preferred slogan.
