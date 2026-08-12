## Context

PDCA hosts already strong-depend on `workspace-isolation-discipline`. A multi-repo local-verify case showed `.worktrees/` isolation breaks sibling `../repo` layouts and full installer packs. Owners chose enhance-in-place with **hard rename** to `git-worktree-discipline`, add `worktree-gate`, and recommend from project state before asking—without depending on Superpowers `using-git-worktrees`.

## Goals / Non-Goals

**Goals**

- Hard rename skill id + directory; zero residual references outside archive history.
- Preference: `worktree-gate: always|never|ask` in AGENTS.md/CLAUDE.md; unset ≡ ask.
- Under ask: recommend suitability then ask; never/always as gate says.
- Encode multi-repo / pack layering in thin reference.md (deidentified examples).
- Closeout still owns destroy.

**Non-Goals**

- Alias directory for old name.
- Strong-depend Superpowers.
- Auto-rewiring sibling repos or inventing one-click pack-in-worktree.
- Changing when the gate runs (still after design-approval, before non-trivial edits).

## Decisions

1. **Rename over alias** — matches repo hard-cut naming discipline; installers pick new name after release.
2. **Preference in AGENTS/CLAUDE** — same pattern as `coverage-gate` / `pr-review-gate`; default ask preserves consent.
3. **Recommend-then-ask** — Agent states fit (good for isolated code+unit; poor for sibling paths / full pack without rebinding) then asks.
4. **Create path unchanged in spirit** — native preferred, else ignored `.worktrees/`.
5. **OpenSpec** — new capability + REMOVED old requirements + MODIFIED closeout; archive syncs main specs.

## Risks / Mitigations

| Risk | Mitigation |
|------|------------|
| Missed residual old id | Full-repo grep excluding archive; CI/skills-index regen |
| Case doc denylist | Deidentify before commit |
| Hosts miss dependency swap | Four hosts + AGENTS table + closeout in one change |

## Migration Plan

1. Add `skills/git-worktree-discipline/` (+ reference).
2. Delete `skills/workspace-isolation-discipline/`.
3. Swap host deps and prose; closeout; AGENTS; docs; main specs on archive.
4. Gen skills-index; lint description/deid; validate openspec.
