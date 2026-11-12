## Context

Human-view opens of `.md` / `.html` are inconsistent across agents (editor preview, Simple Browser, OS browser). `goal-driven-queue` already opens `verification.html` via OS default handlers in `queue-open.mjs`, but the behavior is not a shared, user-invocable skill. Decisions locked with the user: pure Agent discipline (no extension install gate); `user-invocable: true` + AGENTS iron-law pointer; thin-mount on `goal-driven-queue` and `goal-driven-workflow`; name `system-browser-open-discipline`.

## Goals / Non-Goals

**Goals:**

- Single Iron Law: human-view `.md`/`.html` → system default browser.
- Clear boundaries: Agent Read / edit stay out of that channel.
- Platform-agnostic intent wording (no required platform tool enumeration).
- Thin host pointers + frontmatter dependencies with abort-on-missing.
- Contract test locking name, triggers, Iron Law, boundaries, host dependency lines.

**Non-Goals:**

- Installing Chrome extensions or rewriting OS Launch Services.
- Changing Cursor/VS Code explorer click behavior (IDE limitation).
- Wide-mounting every PDCA host.
- Replacing `queue-open.mjs` opener implementation (already OS-default); skill owns agent behavior contract.

## Decisions

### User-invocable discipline

Exception to the default `user-invocable: false` for `*-discipline`, same class as `merge-discipline` / `jira-wiki-markup`: humans say 「用浏览器打开」. Hosts still declare `dependencies` so queue/workflow startups enforce presence.

### Thin mount only

Only `goal-driven-queue` and `goal-driven-workflow` get dependencies + one-line pointers at open sites. Other hosts may opt in later.

### AGENTS.md pointer

Add iron law #12 as a short pointer to the skill (not a second copy of the Iron Law body). Add table row and list the skill under "可独立触发的横切动作".

### Optional appendix only

Markdown Reader / file-association tips live in `reference.md` under an optional appendix heading. Not a gate.

### Contract test first

`scripts/system-browser-open-discipline-contract.test.mjs` asserts skill id, `user-invocable: true`, Chinese triggers, Iron Law phrases, Read/edit boundaries, host dependency strings, and AGENTS pointer.

## Risks / Trade-offs

- [IDE click still opens editor] → Documented non-goal; skill covers agent-initiated human-view opens.
- [Headless CI claims open] → Spec requires path print + skip 留痕 when OS open unavailable.
- [Hosts restate methodology] → Thin-reference rule in host requirements; contract greps for dependency declarations.

## Migration Plan

Add skill + wire two hosts + AGENTS + index. Rollback = revert the change commit. No data migration.

## Open Questions

None — decisions frozen with the user before implementation.
