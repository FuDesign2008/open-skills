## Why

File paths in the HTML views were plain text. A reader could see a key file but could not jump to it from the page.

## What Changes

- Inline code that names an existing file becomes a link to that file.
- Commands, placeholders, and non-file strings stay plain.
- `--file-root <workspace-root>` sets the base for resolving file references.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `goal-queue`: file references in human-facing HTML views link to the source files.

## Impact

- `skills/goal-driven-queue/scripts/render-html.mjs`, `render-html.test.mjs`, `SKILL.md`, `reference.md`, `scripts/human-facing-html-contract.test.mjs`.
- No dependency; no engine template edit.
