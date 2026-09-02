## Why

Two Agent conversations in the same project folder currently share one `.goal-driven/` backlog. Enqueue and 「跑队列」 therefore steal each other's `pending` cards. Isolation must be automatic per conversation — the human never picks a queue name. Folder identity is a minted `queue-id` on disk, not a platform session UUID (those are not portable).

## What Changes

- **BREAKING (layout default):** new cards and run progress documents live under `.goal-driven/queues/<queue-id>/`. Consumption, relationship pass, mid-run re-scan, and the acceptance package are scoped to this conversation's bound directory only.
- **Bind algorithm:** reuse this conversation's bound id; otherwise mint on first enqueue or 「跑队列」. Never ask the human to choose. Never drain sibling queues. A mere load does not mint.
- A new conversation always mints a fresh queue; leftover cards from other conversations stay untouched.
- Scheduled / unattended pull with no conversation bind consumes `default` only (legacy root cards).
- `jira-fix-batch` / `opsx-jira-fix-batch` inherit the same bind (they only call `goal-driven-batch`).

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `goal-queue`: backlog carrier, consume/re-scan scope, progress-document path, and idle overview become per-conversation auto-isolated queues rather than one folder-wide queue.

## Impact

- `skills/goal-driven-batch/SKILL.md`, `reference.md`, `evals/evals.json` (version bump).
- `openspec/specs/goal-queue/spec.md` after archive.
- Thin enqueue shells stay thin; no second layout.
- Runtime artifacts in *user* projects: new subdirectory `queues/`. Existing root cards keep working as `default` for scheduled pulls only.
