## Why

`solve-workflow` and `opsx-solve-workflow` lacked a first-class optional commit + PR/MR path. Delivery was buried in a thin `feature-branch-closeout` pointer (menu only; no `git-commit` orchestration), while Jira hosts inlined Stage 9 / §8.1 commit+PR prose. Not every solve run needs an MR — delivery must be gated. Folding commit into closeout risked double-commit with Jira Stage 9.

## What Changes

- Add shared skill `delivery-discipline`: need-delivery gate → `git-commit` → open/update PR/MR; placeholders `{pr-body-extra}` / `{commit-context}`.
- Wire thin references into `solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow` Stage 9, `opsx-jira-fix-workflow` (archive → delivery → closeout).
- Update `feature-branch-closeout`: option "Open/update PR" delegates to `delivery-discipline`; order documents optional delivery before the menu.
- OpenSpec + `AGENTS.md` dependency tables.

## Capabilities

### New Capabilities

- `delivery-discipline`: optional post-verify code delivery SSOT.

### Modified Capabilities

- `feature-branch-closeout`: compose with `delivery-discipline` for PR-only path; do not inline commit/PR create.

## Impact

- Skills listed above; `docs/generated/skills-index.md` via gen script
- No application runtime code
- Hosts without `delivery-discipline` installed abort at prerequisite check (intentional)
