## Why

Merge-discipline Part C currently auto-runs `test-coverage-analyzer` whenever a merge is imminent and the skill is installed. That default fits coverage-critical apps but wastes time and forces skip留痕 on repos that do not need coverage gates (e.g. Markdown skill libraries). Coverage must be **opt-in per merge** unless the project declares a standing preference.

## What Changes

- **BREAKING (behavior)**: Part C no longer auto-runs the analyzer by default. It MUST resolve a project preference (`always` / `never` / `ask`) from `AGENTS.md` or `CLAUDE.md`; unset ≡ `ask`.
- When preference is `ask`, Part C MUST ask the user on **every** merge whether to run coverage or skip (with 留痕) before Part D.
- When `always`, run the existing gate steps without asking. When `never`, skip with project-preference 留痕 and proceed to Part D.
- Update `merge-discipline` SKILL.md + reference checklist; thin-sync `workflow-contract-sync` requirements that still say “MUST run analyzer first”.
- Host workflows keep pointer-only wording; fix any red-flag lines that imply auto-run without asking.

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `merge-discipline`: Coverage Part C becomes preference-aware + per-merge ask when unset/`ask`; trigger remains “merge imminent”, but run/skip is no longer implicit auto-run.
- `workflow-contract-sync`: Align host-facing coverage-gate requirements with the same ask/preference decision (not “always run analyzer before merge”).

## Impact

- `skills/merge-discipline/SKILL.md`, `skills/merge-discipline/reference.md`
- Thin host touch-ups if needed: `opsx-solve-workflow`, `opsx-jira-fix-workflow`, `jira-fix-workflow`
- Optional example preference line in this repo’s `AGENTS.md` (e.g. `coverage-gate: never` for the skills library) — only if tasks include it
- Downstream agents that assumed auto-run must follow the new ask/preference contract
