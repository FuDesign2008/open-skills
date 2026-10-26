## Why

This repository runs development inside Git worktrees: the queue records live in the main checkout while the changed code lives in a linked worktree. With only the workspace root as a base, a record path such as `.goal-driven/queues/<id>/...` resolved from the main checkout but a code path such as `skills/<name>/scripts/` did not, because the two trees differ. The same record therefore mixed linked and plain references.

## What Changes

- Add the record's repository root (the nearest ancestor of the record containing `.git`) as a resolution tier, after the workspace root.
- A record in the main checkout can link workspace paths from `--file-root` and record-relative paths from its own repository.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `goal-queue`: file-link resolution adds the record's repository root as a tier, so cross-tree records resolve both code and record paths.

## Impact

- `skills/goal-driven-queue/SKILL.md`, `reference.md`, `scripts/render-html.mjs`, `scripts/render-html.test.mjs`, `scripts/human-facing-html-contract.test.mjs`.
- No dependency; no engine template edit; no change to the Markdown source.
