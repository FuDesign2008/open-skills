## Why

`perf-iteration-loop` (the prose-protocol skill) duplicated the loop mechanism that real environment runners (ralph-loop-style plugins with stop-hook continuation and per-round context management) already provide — and a prose protocol cannot deliver forced continuation or context management, only the illusion of them. The user ruled: probe the environment for a real loop; if none, stop optimization execution honestly. Engineering our own ralph-loop equivalent is recorded as a follow-up option only (a plugin project, YAGNI until abort frequency proves the need).

## What Changes

- Delete `skills/perf-iteration-loop/` (the protocol content folds into the host's loop section as the mount body spec)
- `perf-optimize-workflow`: frontmatter `dependencies` drops `perf-iteration-loop`; the loop section becomes an **environment gate** — probe at Stage 5 entry for a loop-runner capability (ralph-style runner / `/loop` / goal-driven long-run / any auto-continue mechanism); found → mount the loop body; not found → stop optimization execution (analysis stages' findings remain deliverable), no degradation to a single manual pass. Runtime strong dependency on the environment (same pattern as effective-web-research → web-access), never a frontmatter dependency. Loop body, stop conditions, and context discipline (persist per round, carry summaries only) now live in the host section.
- AGENTS.md inventory rows updated (host dependency column restored; loop row removed)
- **Non-goals**: implementing a repo loop runner (follow-up project if abort frequency is high); changing the nine evidence disciplines

## Capabilities

### Removed Capabilities

- `perf-iteration-loop`: superseded — the loop is an environment capability plus a mount-body spec owned by `perf-optimize-workflow`

### Modified Capabilities

- `perf-optimize-workflow`: loop Requirement rewritten — from "strong dependency on repo skill perf-iteration-loop" to "runtime environment gate: no loop runner ⇒ optimization execution stops with install guidance; single pass is not a fallback"

## Impact

- Deleted: `skills/perf-iteration-loop/`, `openspec/specs/perf-iteration-loop/`
- Modified: `skills/perf-optimize-workflow/SKILL.md`, `AGENTS.md`, `docs/generated/skills-index.md` (regenerated), `openspec/specs/perf-optimize-workflow/spec.md`
- Behavior: without an environment loop runner the workflow still delivers Stages 1-4 analysis and stops before optimization; with one, rounds run mounted and context-disciplined
- Risk: environments without any loop capability cannot execute optimization (accepted by design — honest abort over fake loop); mitigation is the install guidance printed at the gate
