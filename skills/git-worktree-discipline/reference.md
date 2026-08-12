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

## Detect existing isolation

Before creating anything:

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

**Submodule guard:** `GIT_DIR != GIT_COMMON` is also true inside git submodules. Before concluding “already in a worktree,” check:

```bash
# If this returns a path, you're in a submodule — treat as a normal checkout (may still create a worktree)
git rev-parse --show-superproject-working-tree 2>/dev/null
```

| Condition | Action |
|-----------|--------|
| `GIT_DIR != GIT_COMMON` and **not** a submodule | Already in a linked worktree → reuse; report path + branch (or detached HEAD); skip create |
| `GIT_DIR == GIT_COMMON` or in a submodule | Normal checkout → continue gate / create flow |

Report examples:

- On a branch: `Already in isolated workspace at <path> on branch <name>.`
- Detached: `Already in isolated workspace at <path> (detached HEAD). Branch creation may be needed at finish time.`

## Suitability recommendation (before ask)

Scan quickly (intent + path heuristics), then one short recommendation:

| Signal | Lean |
|--------|------|
| Single repo; verify = unit/typecheck/lint in-repo | **Favor worktree** when primary tree is busy or user wants isolation |
| Scripts/docs assume `../sibling-repo` or copy-into-sibling | **Caution** — worktree under `.worktrees/` breaks default sibling layout unless env/absolute path rebinding is planned |
| User goal = full installer / product pack that assumes primary checkout layout | **Poor fit** for worktree-only verify; prefer code+unit in worktree, pack on primary layout (or explicit rebinding) |
| Uncommitted OpenSpec/analysis artifacts only on primary tree | Reminder: new worktree from `HEAD` does not carry untracked files — sync before execute |
| Missing `node_modules` / deps in new worktree | Run project setup (below); symlink only as a local acceleration — do not commit symlinks |

## Multi-repo sibling checklist

Before claiming “local verify ready” after creating cross-repo worktrees:

- [ ] Any `../sibling` or hardcoded sibling path in scripts?
- [ ] Official env var or config to override sibling root?
- [ ] Layer A (unit/typecheck) run with cwd = worktree?
- [ ] Layer B (integration): copy/link target = same worktree that runs the host process?
- [ ] Avoid promising Layer C (full installer pack) as one-click inside `.worktrees/`?

## Create path

### Native first

If the agent already has a **native** workspace/worktree isolation capability, use it after consent/`always`. Native tools usually own placement, branch, and cleanup visibility. Use git fallback only when no such capability is available — otherwise the harness may not see or manage the directory.

Describe the intent (“isolated workspace for this change”); do not hardcode a single product’s tool name as required.

### Git fallback — directory selection

Explicit user preference always wins. Otherwise:

1. Existing project-local dir: prefer `.worktrees/` if present; else `worktrees/` if present.
2. If neither exists: default to `.worktrees/` at the project root.

```bash
ls -d .worktrees 2>/dev/null
ls -d worktrees 2>/dev/null
```

### Safety: must be ignored

Before `git worktree add` under a project-local directory:

```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

If **not** ignored: append the chosen directory name to `.gitignore` (and include that fix in the change when appropriate). An unignored worktree directory risks committing the whole tree into the repo.

### Create

```bash
path="$LOCATION/$BRANCH_SLUG"
git worktree add "$path" -b "$BRANCH_NAME"
# or: git worktree add "$path" "$EXISTING_BRANCH"
# continue host execute with cwd = that path
```

**Permission / sandbox failure:** if `git worktree add` fails with a permission/sandbox denial, report that isolation was blocked, work in the current directory instead, and leave a short 留痕 (`escape=worktree-create-failed`). Still run setup/baseline in place when applicable.

## Setup + baseline (after create or when already isolated and deps missing)

Auto-detect project markers and run the matching setup (skip sections that do not apply):

```bash
# Node.js
if [ -f package.json ]; then npm install; fi

# Rust
if [ -f Cargo.toml ]; then cargo build; fi

# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install 2>/dev/null || true; fi

# Go
if [ -f go.mod ]; then go mod download; fi
```

Prefer the project’s documented install command when `AGENTS.md` / README specifies one.

Then run a **baseline** check with the project-appropriate command (`npm test`, `cargo test`, `pytest`, `go test ./...`, or the repo’s documented verify script).

| Baseline result | Action |
|-----------------|--------|
| Pass | Report ready (path + brief test summary) |
| Fail | Report failures; ask whether to proceed or investigate — do not silently ignore a red baseline |
| No test/verify command | Skip baseline; say so briefly |

Ready report shape:

```text
Worktree ready at <full-path>
Baseline: <pass summary | skipped: no project test command>
Ready to implement <change>
```

## Remove notes (closeout owns the offer)

```bash
git worktree remove ".worktrees/<branch-slug>"
# --force only with explicit strong user confirmation
```
