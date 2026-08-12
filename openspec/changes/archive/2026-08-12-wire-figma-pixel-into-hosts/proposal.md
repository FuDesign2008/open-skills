## Why

`figma-pixel-implement` / `figma-pixel-verify` already exist, but PDCA hosts only treat them as optional marketplace skills. Agents solving Figma UI work via `solve-workflow` / `opsx-solve-workflow` / `jira-fix-workflow` / `opsx-jira-fix-workflow` often skip export-faithful implement and measured verify. Product owners chose **true strong dependencies** (same pattern as `browser-debug-toolkit`) plus thin stage hooks so hosts abort when the pair is missing and invoke them when Figma UI work is in scope. This **BREAKING**-changes the prior “opt-in / must not abort” contract in `figma-pixel-fidelity`.

## What Changes

- **BREAKING**: `figma-pixel-fidelity` no longer forbids host strong dependencies; the four PDCA hosts MUST list both Figma pixel skills in frontmatter `dependencies` and abort on missing prerequisite checks.
- Add thin, platform-agnostic stage hooks on those hosts: load implement when Figma URL/node or pixel-restore intent is in scope during execution; load verify when this run implemented from Figma or the user/plan requires alignment check.
- Sync `AGENTS.md` dependency columns and any host missing-notice / strong-dependency prose that enumerates deps (per `workflow-contract-sync`).
- Do **not** extract a new routing discipline skill (YAGNI).

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `figma-pixel-fidelity`: Replace opt-in-to-hosts requirement with mandatory host strong dependencies + conditional invoke scenarios; keep platform-agnostic tool intent and adjacent-skill boundaries.
- `jira-fix-workflow`: Require frontmatter strong deps on both Figma pixel skills (mirror `learn-and-improve` style).
- `opsx-jira-fix-workflow`: Same strong-dep requirement for the pair.
- `opsx-solve-workflow`: Require the pair as strong dependencies and document conditional invoke at execute/verify stages (thin host prose, no methodology duplication).

## Impact

- Skills: `solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, `opsx-jira-fix-workflow` frontmatter + thin stage hooks; `AGENTS.md` tables.
- Specs: `figma-pixel-fidelity`, `jira-fix-workflow`, `opsx-jira-fix-workflow`, `opsx-solve-workflow`.
- Install surface: partial skill installs that omit the Figma pair will abort these four hosts (documented; recommend `--skill '*'`).
- No application runtime code; Markdown skills library only.
