## Why

Inventory showed `learn-and-improve` is a strong dependency of `solve-workflow` and `opsx-solve-workflow`, but neither `jira-fix-workflow` nor `opsx-jira-fix-workflow` declares or delegates it. Jira hosts therefore skip structured Act-phase retrospective and startup cannot fail-fast when the skill is missing. Align the two Jira hosts with solution 2: strong dependency + thin closeout delegation, plus companion doc updates.

## What Changes

- Add `learn-and-improve` to frontmatter `dependencies` on `jira-fix-workflow` and `opsx-jira-fix-workflow`.
- Thin-reference the skill at closeout: after stage 10 merge/writeback (`jira-fix-workflow`) and after stage 8.4 / replacing shallow 8.5 (`opsx-jira-fix-workflow`).
- Update `learn-and-improve` "Integrated by" list to include the two Jira hosts.
- Update `AGENTS.md` skill dependency table rows for the two Jira hosts.

## Capabilities

### New Capabilities

- `jira-fix-workflow`: strong-dep + thin closeout delegation to `learn-and-improve` (no main spec yet; introduce contract).
- `opsx-jira-fix-workflow`: same for OPSX Jira host; replace shallow 8.5 with thin load.
- `learn-and-improve`: document Jira hosts as integrators (no main spec yet; introduce contract).

### Modified Capabilities

- (none — no existing `openspec/specs/` entries for these three skills)

## Impact

- Skills: `skills/jira-fix-workflow/SKILL.md`, `skills/opsx-jira-fix-workflow/SKILL.md`, `skills/learn-and-improve/SKILL.md`
- Docs: `AGENTS.md` (category/deps table); `docs/generated/skills-index.md` via pre-commit / `gen-skill-docs`
- No runtime app code; no BREAKING behavior for callers who already have `learn-and-improve` installed; hosts without it will abort at prerequisite check (intentional, matches solve/opsx-solve)
