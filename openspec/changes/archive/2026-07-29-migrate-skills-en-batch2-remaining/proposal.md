## Why

Batch-1 English migration covered six workflow hosts only. Remaining Chinese instructional bodies and leftover Chinese `reference.md` templates still violate `skill-authoring-language` and reduce LLM instruction fidelity. Migrate them now with in-change lightweight evals (2–3 prompts per skill vs Chinese snapshot), matching the agreed verification bar.

## What Changes

- Translate remaining Chinese-primary instructional content to English for the confirmed inventory (P0 + P1), keeping Chinese triggers and contractual slogans.
- Clean batch-1 leftover Chinese templates in `jira-fix-workflow/reference.md` and `solve-workflow/reference.md`.
- Run lightweight skill-creator-style evals (2–3 prompts/skill, `with_skill` vs Chinese `old_skill` snapshot) and keep summary tooling under `skills/_eval-en-batch2-tools/`.
- Extend OpenSpec requirements to document batch-2 coverage and lightweight-eval expectations for this follow-up.

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `skill-authoring-language`: add batch-2 coverage scenario for remaining skills / leftover references after batch-1.
- `skill-creator-eval-harness`: clarify that deferred-eval follow-ups MAY use a lightweight 2–3 prompt batch when product owners choose that bar (already practiced in batch-1 eval change).

## Impact

- Skills: `perf-workflow`, `frontend-perf`, `git-conflict-resolve`, `git-release-start`, `merge-discipline`, `jira-fix-workflow` (reference), `solve-workflow` (reference), `known-issue-research` (reference), `code-design-review`, `solution-review`.
- Exception unchanged: `article-writer`.
- Docs index regeneration via pre-commit / `gen-skill-docs.mjs` if descriptions change.
- No runtime app code; release bump when `skills/` changes land on main.
