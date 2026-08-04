## Context

Correct #264: keep strong deps on external humanizers; remove vendored copies.

## Goals / Non-Goals

**Goals:** delete in-repo skills; external install hints (B); update AGENTS/index/specs; push to same PR.

**Non-Goals:** weakening to optional deps; re-vendoring.

## Decisions

1. Amend #264 branch in place.
2. Delete `openspec/specs/humanizer` and `humanizer-zh` after REMOVED archive (or leave empty Purpose-only — prefer delete directories).
3. Prerequisite block in write-workflow documents per-dep install commands.

## Risks

| Risk | Mitigation |
|------|------------|
| Upstream rename breaks name match | Document exact names; user can symlink |
| Archive history still describes vendoring | New change REMOVED + note in proposal |

## Open Questions

None.
