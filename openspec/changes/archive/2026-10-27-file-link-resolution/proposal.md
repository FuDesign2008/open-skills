## Why

File-link detection mixed two rules: a code span had to look like a path (contain a slash or a known extension) and then had to exist under one of four roots. The result was inconsistent on a single page: `skills/.../SKILL.md` linked, `reference.md` did not, `config` existed in the queue root but was never tried, and record names such as `progress.md` did not resolve from the card page. The user asked for one general rule instead of page-level patches.

## What Changes

- Link inline code by existence only: an existing file or directory matches; the extension/slash heuristic is gone.
- Resolve nearest-first in tiers: the record directory, the queue root, the workspace root, the batch directories, then the skill directory.
- Within a tier, link only when exactly one distinct path matches; globs and ambiguous names stay plain.
- Document the rule in `SKILL.md` and `reference.md`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `goal-queue`: file references link by existence and nearest-first tier resolution, including bare file and directory names.

## Impact

- `skills/goal-driven-queue/SKILL.md`, `reference.md`, `scripts/render-html.mjs`, `scripts/render-html.test.mjs`, `scripts/human-facing-html-contract.test.mjs`.
- No dependency; no engine template edit; no change to the Markdown source.
