## Why

Human-facing queue records were written in English regardless of the human's language, so a Chinese user could not comfortably read the acceptance package.

## What Changes

- Human-facing queue records (task cards, triage, progress, verification, completion reports) and their HTML views are written in the language the human used in the conversation.
- `SKILL.md`, agent-only reference/spec files, and code identifiers stay English.
- Entry-page labels and HTML footers are localized to the human's language.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `goal-queue`: human-facing records and HTML views use the human's language; the skill body and agent-only files stay English; entry-page labels and footers are localized.

## Impact

- `skills/goal-driven-queue/SKILL.md`, `reference.md`, `scripts/render-html.mjs`, `scripts/render-html.test.mjs`, `scripts/human-facing-html-contract.test.mjs`.
- No new dependency; no engine template edit.
