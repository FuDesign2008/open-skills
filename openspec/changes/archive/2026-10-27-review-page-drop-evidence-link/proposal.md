## Why

The review page repeated a standalone "证据留痕" link at the bottom. The acceptance entry page already has a link card for the evidence page, and every view carries the shared navigation block, so the bottom link is redundant and pulls the eye away from the explanation.

## What Changes

- The review page no longer renders a standalone link to the evidence page.
- The evidence page stays reachable from the acceptance entry page and the shared navigation block.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `goal-queue`: the review HTML page no longer adds a standalone evidence link; the shared navigation and the acceptance entry page reach it.

## Impact

- `skills/goal-driven-queue/SKILL.md`, `scripts/render-html.mjs`, `scripts/render-html.test.mjs`, `scripts/review-html-flow-contract.test.mjs`.
- No dependency; no engine template edit; no change to the Markdown source.
