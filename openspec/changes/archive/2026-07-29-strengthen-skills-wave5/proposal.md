## Why

After waves 1–4 extracted shared disciplines into SSOT skills, host `reference.md` files still carry duplicated analysis/industry templates and an outdated solve-workflow missing-dependency notice. Lean cleanup (R1) reduces drift and token cost without changing runtime methodology.

## What Changes

- Lean `jira-fix-workflow/reference.md`: Stage 3 analysis template → pointer to `analysis-core` + keep jira-only fields (artifact path, difficulty pre-assessment, gate notes); Industry-Wide full template → pointer to `known-issue-research` + keep jira **gate** divergence (stop + Jira comment).
- Sync `solve-workflow/reference.md` Prerequisite Skill Check dependency list with current frontmatter (waves 1–4 disciplines).
- **Out of scope**: P1 template moves (writeback/closeout reference extraction); four-host SKILL rewrites; new shared skills.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `workflow-contract-sync`: host `reference.md` MUST NOT restate shared analysis/industry methodology skeletons; Missing Notice lists MUST match frontmatter dependencies; jira MAY keep gate-only divergence text.

## Impact

- Edit: `skills/jira-fix-workflow/reference.md`, `skills/solve-workflow/reference.md`
- Optional light bump of host skill patch versions if required by repo convention (content-only reference may skip version bump)
- Docs: no new skills-index rows
