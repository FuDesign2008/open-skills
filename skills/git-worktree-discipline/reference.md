# git-worktree-discipline — reference

## Preference parse

Look in repo-root `AGENTS.md` then `CLAUDE.md` for a line like:

```text
worktree-gate: always
worktree-gate: never
worktree-gate: ask
```

| Value | Behavior |
|-------|----------|
| `always` | Create/reuse isolation when possible; no consent prompt |
| `never` | Skip create; short 留痕 |
| `ask` or unset | Recommend from state, then ask create / decline / lean |

Same declaration style as `coverage-gate` / `pr-review-gate`.

## Suitability recommendation (before ask)

Scan quickly (intent + path heuristics), then one short recommendation:

| Signal | Lean |
|--------|------|
| Single repo; verify = unit/typecheck/lint in-repo | **Favor worktree** when primary tree is busy or user wants isolation |
| Scripts/docs assume `../sibling-repo` or copy-into-sibling | **Caution** — worktree under `.worktrees/` breaks default sibling layout unless env/absolute path rebinding is planned |
| User goal = full installer / product pack that assumes primary checkout layout | **Poor fit** for worktree-only verify; prefer code+unit in worktree, pack on primary layout (or explicit rebinding) |
| Uncommitted OpenSpec/analysis artifacts only on primary tree | Reminder: new worktree from `HEAD` does not carry untracked files — sync before execute |
| Missing `node_modules` in new worktree | Symlink or install in the worktree; do not commit symlinks |

## Multi-repo sibling checklist

Before claiming “local verify ready” after creating cross-repo worktrees:

- [ ] Any `../sibling` or hardcoded sibling path in scripts?
- [ ] Official env var or config to override sibling root?
- [ ] Layer A (unit/typecheck) run with cwd = worktree?
- [ ] Layer B (integration): copy/link target = same worktree that runs the host process?
- [ ] Avoid promising Layer C (full installer pack) as one-click inside `.worktrees/`?

## Create / remove notes

**Create (git fallback):**

```bash
# ensure ignored
grep -qxF '.worktrees/' .gitignore || echo '.worktrees/' >> .gitignore

git worktree add ".worktrees/<branch-slug>" -b "<branch>"
# or: git worktree add ".worktrees/<branch-slug>" "<existing-branch>"
```

**Remove (closeout owns offer):**

```bash
git worktree remove ".worktrees/<branch-slug>"
# or: git worktree remove --force … only with explicit strong user confirmation
```

Native agent workspace tools: use the host’s isolation capability when available; record the path the same way for closeout.
