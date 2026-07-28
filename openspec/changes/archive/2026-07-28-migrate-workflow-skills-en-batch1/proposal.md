## Why

Six high-traffic workflow skills still ship Chinese-majority bodies (`solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, `opsx-jira-fix-workflow`, `jira-fix-batch`, `opsx-jira-fix-batch`), conflicting with the repo rule that skill bodies (including `reference.md`) are English for LLM accuracy while Chinese triggers remain in frontmatter/pointers. A follow-up change will run full skill-creator eval loops; this batch does authoring-standard English rewrite plus lean refactor with light verification.

## What Changes

- Rewrite batch-1 skill bodies and references to English; keep Chinese trigger phrases in `description` and clarifying pointers (e.g.「一次一问、多轮问清」).
- Lean while translating: drop duplicated shared-skill prose already owned by `analysis-core` / `clarifying-question-discipline` / etc.; move bulky templates to `reference.md` when over the five-line rule.
- Add OpenSpec capability for skill authoring language; touch workflow-contract specs only if lean edits change normative host behavior.
- **Not** in this change: `article-writer` exception; perf/git/merge leftovers; full skill-creator eval rings.

## Capabilities

### New Capabilities

- `skill-authoring-language`: Skill body/reference English-by-default; Chinese triggers required in description where applicable; Chinese-only exception skills (e.g. `article-writer`) allowed.

### Modified Capabilities

- `workflow-contract-sync`: Only if lean English rewrite changes a stated host contract (otherwise no delta).

## Impact

- Skills under `skills/{solve-workflow,opsx-solve-workflow,jira-fix-workflow,opsx-jira-fix-workflow,jira-fix-batch,opsx-jira-fix-batch}/`
- Docs index via `gen-skill-docs` if descriptions change
- Downstream agents relying on Chinese body prose must follow English instructions (triggers unchanged)
