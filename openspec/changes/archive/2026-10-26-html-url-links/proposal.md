## Why

Plain `http(s)` URLs in the HTML views were text, so the reader had to copy them to open the target.

## What Changes

- Plain `http(s)` URLs in body text become links.
- URLs inside code spans and Markdown links keep their own rendering.
- Trailing punctuation is kept outside the link.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `goal-queue`: plain URLs in human-facing HTML views are links.

## Impact

- `skills/goal-driven-queue/scripts/render-html.mjs`, `render-html.test.mjs`, `SKILL.md`, `reference.md`, `scripts/human-facing-html-contract.test.mjs`.
- No dependency; no engine template edit.
