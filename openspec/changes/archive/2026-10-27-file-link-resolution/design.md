## Context

`renderFile` built `fileLink` from two conditions: the code span had to look like a path (contain `/` or end with a known extension), then it had to exist under `fileRoot`, the queue root, the source directory, or the output directory. The heuristic produced both false negatives (`config` exists but has no extension) and uneven coverage (`reference.md` is path-shaped but lives in the skill directory; `progress.md` lives in a batch directory).

## Goals / Non-Goals

**Goals:**

- One explainable rule: a code span links when it names an existing path, using nearest-first tiers.
- Bare filenames and directories link when they resolve unambiguously.
- Globs and ambiguous names never guess.

**Non-Goals:**

- Searching the whole workspace for a basename.
- Semantic inference about which skill a bare name belongs to.
- Linking non-path commands or placeholders.

**Decisions**

- Drop the path-shape heuristic; existence is the only gate. `md`, `.html`, and `npm test` stay plain because no such path exists at the tiers.
- Tiers, nearest first: record directory → queue root → workspace root → batch directories (`<queue-root>/runs/*`) → skill directory (the renderer's own skill). The nearest tier with a match wins, so `scripts/` resolves to the workspace `scripts/` before the skill's `scripts/`.
- Inside one tier, collect distinct resolved paths. Zero → try the next tier; one → link; more than one → plain. This keeps a multi-batch queue from guessing which `progress.md` is meant.
- Globs (`*`, `?`) are rejected before resolution.
- Directories are valid targets; the link opens the folder.

## Risks / Trade-offs

- [A bare name from another skill resolves to the queue skill's file] → The skill directory is the last tier and only applies when nothing nearer matches; queue records rarely use bare skill filenames for other skills.
- [A top-level directory name used as a concept links to the directory] → The link points at the real directory the text names; the visible ↗ marker makes it explicit.
- [Ambiguity after several batches] → The name stays plain rather than linking the wrong batch.
- [Stat cost per code span] → A handful of `existsSync` calls per span; the renderer stays dependency-free and fast for record-sized documents.

## Migration Plan

Regenerate existing views. Rollback is reverting the renderer and the two skill sentences.

## Open Questions

None.
