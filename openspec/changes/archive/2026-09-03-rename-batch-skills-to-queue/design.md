## Context

Queue child of `q-20260903-162738` (`Engine: opsx-solve-workflow`, `Stage-exit policy: ai-proxy`). Approach frozen in the parent solve-workflow: family suffix `queue`, not `enqueue`; `opsx-` kept; eight `*-workflow` hosts unchanged; no skill-naming taxonomy delta.

`worktree-gate` is `ask`. Isolation for this child is a dedicated feature branch on the primary checkout so the bound `.goal-driven/queues/q-20260903-162738/` cards stay visible. Linked worktree skipped (untracked queue files would not follow `HEAD`).

## Goals / Non-Goals

**Goals:** Hard-cut the three skill ids; zero live hits outside archive; regenerate skills index; keep old ids as description triggers only.

**Non-Goals:** Renaming `*-workflow` hosts; changing `opsx-` prefix; alias directories; renaming `openspec/specs/goal-queue/`; adding `-queue` to `skill-naming`; pruning global installs (human post-release).

## Decisions

1. Replace longest id first (`opsx-jira-fix-batch` before `jira-fix-batch`) so string replace cannot clip prefixes.
2. Capability folder stays `goal-queue` (same pattern as `goal-run` / `goal-driven-workflow`).
3. On-disk `.goal-driven/.../runs/<batch-id>/` is a run timestamp, not a skill id — leave it.
4. Incident doc filenames under `docs/` that contain the old id are renamed only if content replacement is not enough for the live `rg` gate; prefer content replace first.

## Risks

| Risk | Mitigation |
|------|------------|
| Missed live string | Final `rg` excluding `openspec/changes/archive/` |
| Agents still say old names | Keep old ids in `description` triggers |
| Stale global skill dirs | Release note: `install-skills.mjs` prune |
