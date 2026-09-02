## Context

`goal-driven-batch` stores one project-local backlog at `.goal-driven/`. Cards are git-trackable; two Agent conversations in the same cwd therefore share one pending set. Users run different work in parallel conversations and need those backlogs not to steal each other. They also do not want to name or pick a queue.

Constraints: skill body stays platform-agnostic (no Cursor/Claude/OpenCode session UUID as a required id); Jira batch shells stay thin; existing root-level cards must remain readable for scheduled `default`.

## Goals / Non-Goals

**Goals:**
- Opening a new conversation auto-isolates: enqueue and 「跑队列」 never touch another conversation's cards.
- The human never picks or names a queue on the default path.
- Same conversation continues the same drawer via conversation memory + files.

**Non-Goals:**
- Platform session APIs as the isolation key.
- A project-level `.active-queue` file (another conversation would overwrite it).
- Asking the human to resume yesterday's queue in a **new** chat (that conversation mints fresh; leftover files stay on disk).
- Auto-moving legacy root cards.
- Cross-queue scheduling, merging, or priority across queue-ids.

## Decisions

1. **Minted folder id, silent to the human.** Isolation is `.goal-driven/queues/<queue-id>/`. The agent remembers the bound id in this conversation. The human is not asked to remember or choose it. Alternative rejected: named-queue picker (user asked never to 点名).

2. **Bind order.** (a) this conversation already bound → reuse; (b) first enqueue or 「跑队列」 → mint `q-YYYYMMDD-HHMMSS` (append `-` + 4 hex on collision); (c) mere load → do not mint, do not list siblings as a picker; (d) scheduled pull with no conversation → `default` only.

3. **New conversation does not inherit leftovers.** A new chat never auto-binds `default` or the newest `q-*` sibling — that would recreate stealing. Same-chat resume is the only automatic resume.

4. **Legacy `default`.** Root `.goal-driven/*.md` plus `.goal-driven/runs/` belong to `default`. Only scheduled/unattended pulls with no conversation bind consume it. Interactive conversations mint instead.

5. **No shared pointer file.** Binding lives in conversation memory. Alternative rejected: `.goal-driven/CURRENT`.

6. **Relationship pass stays intra-queue.**

## Risks / Trade-offs

- [Yesterday's pending cards sit unused in a new chat] → Accepted: isolation over cross-chat resume. Same conversation still continues them.
- [Mint collision at the same second] → 4-hex suffix on existing dir.
- [Overnight cron] → consume `default` only, never all `q-*` drawers.
- [Context loss mints a second drawer in the "same" chat] → leftover first drawer stays on disk; no steal.

## Migration Plan

- New enqueue/run creates `queues/<id>/`. Existing root cards remain `default` for scheduled pulls.
- Rollback: agents can still read legacy root cards; new subdirs are unused leftover files.

## Open Questions

(none — auto-isolate without naming is closed)
