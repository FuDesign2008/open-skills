## Why

The HTML views were light-only. They are read during the day and at night, so they should follow the operating system's light/dark preference automatically instead of requiring a manual switch.

## What Changes

- Add light and dark palettes using CSS variables.
- Select the palette automatically with `prefers-color-scheme`; no script is required.
- Print uses the light palette.
- The same rules apply to every covered view and the entry dashboard.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `goal-queue`: human-facing HTML views follow the system light/dark preference automatically.

## Impact

- `skills/goal-driven-queue/scripts/render-html.mjs` (CSS), `SKILL.md`, `reference.md`, `scripts/human-facing-html-contract.test.mjs`.
- No dependency; no engine template edit.
