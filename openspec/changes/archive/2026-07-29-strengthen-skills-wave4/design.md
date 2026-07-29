## Context

Wave 4: M5 decision fog + S5 workspace isolation. R1 reference lean deferred.

## Goals / Non-Goals

**Goals:** two new disciplines; thin host refs; closeout composition for destroy-only.

**Non-Goals:** Wayfinder tracker chain; mandatory worktrees always; R1 reference sweep; SessionStart bootstrap.

## Decisions

1. Names: `decision-fog-discipline`, `workspace-isolation-discipline`.
2. M5: user-invocable true optional — use **false** + host load for consistency with other disciplines (user can still trigger via host / explicit load).
3. S5: after design-approval, before execute; optional.
4. Auto escape for this change's own markdown work: named auto 留痕.

### Stage 4 review — Pass (auto; solution 1)

## Risks / Trade-offs

- [M5 vs stage 3] → Fog first, then explore solutions
- [S5 vs closeout] → Create vs destroy split
- [Mandatory isolation friction] → Offer + decline / lean 留痕

## Migration Plan

Implement → lint → validate → verify → user archive/PR.

## Open Questions

None blocking.
