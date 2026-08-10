## Why

`goal-driven-workflow` still carries Chinese stage/gate prose, Claude-Code-first launch wording, and inlined approval/evidence walls that duplicate shared disciplines. After clarifying touchpoint cleanup, a full pass should English the body+templates, express harness steps as intent-first (with `/goal` as primary example + generic fallback), thin-ref `design-approval-gate` / `completion-evidence-discipline`, and drop Red Flag ↔ Common Mistakes duplication.

## What Changes

- Rewrite `skills/goal-driven-workflow/SKILL.md` body to English; keep Chinese triggers only in `description` / invocation trigger list.
- Rewrite `skills/goal-driven-workflow/reference.md` templates and `/goal` cheat sheet to English; frame Claude CLI / CLAUDE.md / PostToolUse as **primary-harness examples** with generic equivalents (project convention file, post-edit validation hooks, non-interactive agent CLI).
- Stage 4: thin-ref `design-approval-gate` + long-run-specific high-impact pause rules (auto mode still pauses).
- Stage 5: thin-ref `completion-evidence-discipline` (already a dependency) instead of restating evidence iron law.
- Deduplicate Common Mistakes vs per-stage Red Flags (keep one layer).
- Add `commands/goal-run.md` shortcut (`disable-model-invocation: true`).
- Declare `design-approval-gate` in frontmatter `dependencies` if stage 4 loads it as strong; keep `completion-evidence-discipline`.
- Bump skill version (e.g. `0.2.0`); regen skills-index.
- Update `openspec/specs/goal-run` for English/platform-agnostic host wording and thin gate refs.

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `goal-run`: skill/reference MUST be English in instructional body (Chinese triggers remain in description); launch/preflight MUST be intent-first and platform-agnostic with named primary-harness examples allowed; long-run start approval MUST thin-ref `design-approval-gate` (plus long-run-specific triggers); completion reporting MUST thin-ref `completion-evidence-discipline`; optional command entry `goal-run` MAY exist.

## Impact

- Skills: `goal-driven-workflow/SKILL.md`, `reference.md`; new `commands/goal-run.md`; `docs/generated/skills-index.md`; AGENTS.md dependency row if `design-approval-gate` added.
- Specs: `openspec/specs/goal-run/spec.md`.
- Branch: land on `feat/rewrite-clarifying-question-discipline` (PR #270) or split PR — default same branch unless user prefers split.
