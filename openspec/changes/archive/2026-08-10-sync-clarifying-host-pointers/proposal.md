## Why

After rewriting `clarifying-question-discipline` (grilling-style, English body), an audit of integrators showed most hosts remain thin and correct. Only `goal-driven-workflow` still lightly restates the purpose→constraints→success checklist and uses a Chinese-only pointer without the English Prefer line. Align that host so clarifying stays the single source of truth.

## What Changes

- Update `skills/goal-driven-workflow/SKILL.md` stage 1:
  - Prominent pointer: English Prefer line from clarifying; optional Chinese locale-equivalent one-liner allowed.
  - Remove restated `purpose → constraints → success criteria` priority chain; keep "ONE question per turn" + load clarifying.
  - Add Red Flag for dumping multiple questions / rushing to answer during clarification.
- Do **not** mass-edit other clarifying dependents (`solve` / `opsx` / `jira` / `write` / `tech-review` / `perf`).
- Do **not** rename dependencies or add external `grill-me` / `brainstorming`.

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `goal-run`: stage-1 clarification MUST thin-reference `clarifying-question-discipline` without restating its question-priority checklist; pointer SHOULD match clarifying's Prefer English slogan (locale one-liner optional); Red Flag for multi-question dumps REQUIRED at the clarify stage.

## Impact

- Skill: `skills/goal-driven-workflow/SKILL.md` (+ skills-index if description unchanged — likely no index change).
- Spec: `openspec/specs/goal-run/spec.md` via this change's delta then archive.
- Other clarifying hosts: no file changes in this change.
- Related open PR #270 (clarifying rewrite) may land the same branch or separately; this change is independently archivable.
