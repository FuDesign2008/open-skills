## Why

Three user-invocable skills still share the suffix `-batch` after the 2026-09-02 thinning: `goal-driven-batch` owns the persistent queue, while `jira-fix-batch` / `opsx-jira-fix-batch` only parse Jira lists and enqueue. The shared suffix hides that split and makes the shells sound like they run fixes. The ids should name the queue vs the family queue-entry, without changing behavior.

## What Changes

- **BREAKING**: `goal-driven-batch` → `goal-driven-queue` (directory, frontmatter `name`, live references).
- **BREAKING**: `jira-fix-batch` → `jira-fix-queue`.
- **BREAKING**: `opsx-jira-fix-batch` → `opsx-jira-fix-queue` (`opsx-` prefix kept).
- Description trigger lists keep the old ids so existing spoken/typed names still route.
- No alias directories. `openspec/specs/goal-queue/` folder name stays. Eight `*-workflow` host ids stay. `skill-naming` taxonomy is not extended this change.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `goal-queue`: requirements that name the orchestrator skill and the two Jira list-enqueue shells MUST use the new skill ids; queue lifecycle and shell duties are unchanged.
- `skill-authoring-language`: scenarios that list those skill ids MUST use the new ids.

## Impact

- `skills/goal-driven-batch/`, `skills/jira-fix-batch/`, `skills/opsx-jira-fix-batch/` (git mv + `name` + titles + evals).
- Live references in `skills/` (hosts, lifecycle), `AGENTS.md`, `openspec/specs/goal-queue`, `openspec/specs/skill-authoring-language`, `docs/` (including generated skills index).
- Archive history under `openspec/changes/archive/` is left as-is.
- Global installs: `npx skills add` does not delete old directories; prune via `install-skills.mjs` after release (human).
- Merge stays human; this change opens a PR after archive.
