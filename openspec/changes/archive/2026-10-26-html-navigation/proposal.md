## Why

The covered HTML views are interrelated, but only `verification.html` links to the others. A reader who opens the card, report, or evidence page cannot jump elsewhere.

## What Changes

- Every generated human-facing HTML view carries a shared navigation block linking to the entry page and the other covered views.
- Navigation links are relative, resolve to existing files, and mark a missing target as unavailable.
- The block needs no script and works offline; the dispatcher generates it from one manifest.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `goal-queue`: every human-facing HTML view carries cross-navigation to the entry page and the other covered views.

## Impact

- `skills/goal-driven-queue/SKILL.md`, `reference.md`, `scripts/render-html.mjs`, `scripts/render-html.test.mjs`, `scripts/human-facing-html-contract.test.mjs`.
- No dependency; no engine template edit.
