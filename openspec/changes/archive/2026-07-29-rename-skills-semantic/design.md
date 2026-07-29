## Context

open-skills ships ~48 project skills. Naming was only kebab-case; role taxonomy was implicit. This change hard-cuts three opaque ids and records naming rules as OpenSpec capability `skill-naming`. Review passed (manual); execution proceeds in auto mode through verification.

## Goals / Non-Goals

**Goals:**

- Land `skill-naming` requirements (taxonomy, `opsx-` vs native `openspec-*`, ban new `pdca-*` skill ids, hard-cut discipline).
- Hard-cut:
  - `ensure-tests` → `test-suite-ensure`
  - `openspec-workspace-gates` → `opsx-workspace-gate`
  - `pdca-review-orchestration` → `staged-review-flow`
- Rename matching `openspec/specs/<old>/` capability directories to the new ids on archive/sync.
- Update all live references (skills, AGENTS.md, hosts, related specs) so old ids have zero hits outside archive history.
- Regenerate `docs/generated/skills-index.md`.

**Non-Goals:**

- Renaming existing `opsx-solve-workflow` / `opsx-jira-fix-*`.
- Renaming `think-big`, `go-deploy`, `learn-and-improve`, `frontend-perf`.
- Renaming `.claude/skills/openspec-*` native OpenSpec skills.
- Compatibility alias directories or dual names.
- Rewriting all English body prose that still says “orchestration” / “PDCA stages” (id change only; optional wording cleanup is non-blocking).

## Decisions

1. **Order of edits:** `git mv` skill directories first → update frontmatter `name` + titles → bulk replace references → `git mv` `openspec/specs/` capability dirs when merging delta (or during apply before archive) → regenerate skills index → `openspec validate`.
2. **Version bumps:** patch or minor bump on each renamed skill (`test-suite-ensure`, `opsx-workspace-gate`, `staged-review-flow`); hosts that only change dependency strings get patch if versioned for contract sync.
3. **Delta specs stay under old capability folder names** in `openspec/changes/.../specs/` until archive; main-tree `openspec/specs/` is renamed to the new capability ids when syncing so the living contract matches skill ids.
4. **Native gate unchanged:** `opsx-workspace-gate` continues to require exact `openspec-new-change` / `continue` / `apply` / `archive` names.
5. **No alias:** install docs / PR body carry a three-row migration table only.

### Alternatives considered

- Soft aliases for one release → rejected (user: hard cut).
- Rename native `openspec-*` → rejected (upstream contract).
- Broader first-batch (think-big, etc.) → rejected by user.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Missed string references | Final `rg` zero-hit on old ids in `skills/`, `commands/`, `AGENTS.md`, `openspec/specs/`, `docs/` (exclude `changes/archive` if needed) |
| Half-renamed worktree | Single PR; do not push until grep clean |
| Consumers still invoke old names | PR/release notes migration table; **BREAKING** called out |
| Archive merge leaves old capability dir | Explicit `git mv` of `openspec/specs/{ensure-tests,openspec-workspace-gates,pdca-review-orchestration}` → new names in tasks |

## Migration Plan

1. Implement renames on `feat/rename-skills-semantic`.
2. Merge via merge-discipline after archive.
3. Users: reinstall skills (`node scripts/install-skills.mjs` / `npx skills add ...`); update any personal rules that named the old ids.
4. Rollback: revert the merge commit (two-way for this repo).

## Open Questions

None blocking. Optional post-change: scrub “orchestration” wording inside `staged-review-flow` body in a follow-up.
