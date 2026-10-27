## Context

The tier rule resolved names against the record directory, the queue root, the workspace root, the batch directories, and the skill directory. In this repository, queue records are written in the main checkout while a card's code changes live in a linked worktree (the worktree discipline). With `--file-root` pointing at the worktree, record paths such as `.goal-driven/...` stopped resolving; with it pointing at the main checkout, changed code paths such as `skills/<name>/scripts/` stopped resolving.

## Goals / Non-Goals

**Goals:**

- One record can link both its own repository's paths and the code workspace's paths.
- Keep the nearest-first order deterministic.

**Non-Goals:**

- Supporting arbitrary extra roots from the CLI.
- Resolving paths across unrelated repositories.

**Decisions**

- Add a tier for the record's repository root: walk up from the record until a directory contains a `.git` entry (a directory or a worktree's `.git` file).
- Order: record directory → queue root → workspace root (`--file-root`) → record's repository root → batch directories → skill directory. The workspace root comes before the record's repository root so changed code in the worktree wins over a stale copy in the main checkout.
- No new CLI flag; the tier is derived from the record path.

## Risks / Trade-offs

- [A path exists in both the workspace and the record repo] → The workspace wins; for changed code that is the fresher tree.
- [Walking up crosses an unexpected repository] → The walk stops at the first `.git` ancestor and only applies when nearer tiers miss.

## Migration Plan

Regenerate existing views. Rollback is reverting the renderer and the two skill sentences.

## Open Questions

None.
