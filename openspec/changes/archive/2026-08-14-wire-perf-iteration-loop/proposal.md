## Why

The iteration loop was wired as a weak reference ("use when the environment provides a runner"), which lets executors degrade to one-pass optimization — losing the paradigm's compounding effect (36 loop rounds → -77% in the native campaign). The user ruled: the loop must be a strong dependency. Direct dependency on an environment plugin (ralph-loop) is infeasible — it is not a repo skill and cannot be installed via `npx skills`, so the prerequisite check would abort everywhere else.

## What Changes

- Create `skills/perf-iteration-loop/` (`user-invocable: false`, no dependencies): the loop protocol itself — six-step round contract (profile → one target → optimize → A/B judge → correctness gate → commit+snapshot+log), stop conditions (5 no-gain / target met / ROI out), per-round disciplines, platform-agnostic execution tiers (environment loop runner accelerates; self-driven rounds obey the identical contract)
- `perf-optimize-workflow` frontmatter `dependencies` adds `perf-iteration-loop`; the optional loop section becomes "mandatory orchestration for Stages 5-6"; single pass is an explicit user-requested exception
- AGENTS.md inventory updated (dependency column + new row)
- **Non-goals**: bundling a specific loop runner into the repo; changing the nine evidence disciplines

## Capabilities

### New Capabilities

- `perf-iteration-loop`: hard loop-protocol skill — round contract, stop conditions, execution tiers; mounted via host frontmatter dependency

### Modified Capabilities

- `perf-optimize-workflow`: new Requirement — Stages 5-6 MUST execute as the iteration loop governed by `perf-iteration-loop`; missing dependency aborts at prerequisite check

## Impact

- New: `skills/perf-iteration-loop/SKILL.md`
- Modified: `skills/perf-optimize-workflow/SKILL.md` (frontmatter + loop section), `AGENTS.md`, `docs/generated/skills-index.md` (regenerated)
- Behavior: optimization runs are loop-shaped by default; single-pass requires explicit user request
- Risk: none external (PR #277 not yet merged; no published 1.x contract broken — version stays pre-release on the branch)
