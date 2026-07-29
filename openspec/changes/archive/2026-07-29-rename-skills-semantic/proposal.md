## Why

Skill directory names in this repo are only constrained to kebab-case; there is no shared role taxonomy, so agents and humans cannot reliably infer host vs discipline vs gate vs toolkit from the name. Several identifiers are opaque or jargon-heavy (`openspec-workspace-gates` vs project brand `opsx-*`, `pdca-review-orchestration`, `ensure-tests` colliding conceptually with `test-first-discipline`). This change locks a naming convention and hard-cuts a small first batch (including internal skills) so the convention is enforced by example.

## What Changes

- **Add** a repo-level **skill naming taxonomy** (role suffixes / prefixes, collision rules, forbidden prefixes for *project* skills).
- **BREAKING** hard-cut renames (no compatibility aliases):
  - `ensure-tests` → `test-suite-ensure`
  - `openspec-workspace-gates` → `opsx-workspace-gate`
  - `pdca-review-orchestration` → `staged-review-flow`
- **BREAKING** rename matching OpenSpec capability directories under `openspec/specs/` to the new skill names (same three).
- Update all in-repo references: frontmatter `dependencies`, SKILL/reference bodies, `AGENTS.md`, commands if any, generated skills index, related specs (e.g. `workflow-contract-sync`).
- **Explicit non-goals / out of scope for this change:**
  - Do **not** rename existing `opsx-solve-workflow` / `opsx-jira-fix-workflow` / `opsx-jira-fix-batch`.
  - Do **not** rename `think-big`, `go-deploy`, `learn-and-improve`, `frontend-perf`.
  - Do **not** rename OpenSpec **native** skills under `.claude/skills/openspec-*` (`openspec-new-change`, etc.); those remain upstream contract names. The gate skill continues to require those exact native names.
  - Do **not** introduce new `pdca-*` project skill names; prose may still say “PDCA stages” where pedagogically useful.

## Capabilities

### New Capabilities

- `skill-naming`: Behavioral rules for how project skills MUST be named (role vocabulary, `opsx-` vs native `openspec-*`, ban on new `pdca-*` skill ids, hard-cut rename discipline).

### Modified Capabilities

- `ensure-tests`: **BREAKING** identity and requirement text migrate to skill/capability name `test-suite-ensure` (behavior unchanged aside from naming).
- `openspec-workspace-gates`: **BREAKING** identity migrates to `opsx-workspace-gate` (gate behavior unchanged; still requires native `openspec-*` skill names).
- `pdca-review-orchestration`: **BREAKING** identity migrates to `staged-review-flow` (review-flow behavior unchanged; drop `pdca-` / `orchestration` from the skill id).
- `workflow-contract-sync`: Host thin-refs and dependency tables MUST use the new skill names after the hard cut.

## Impact

- **Skills / install surface**: directory rename + frontmatter `name`; global `npx skills` installs break for old names (documented migration table in PR/changelog).
- **Hosts**: `solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, `opsx-jira-fix-workflow`, plus any skill listing the three in `dependencies` or body text.
- **OpenSpec**: `openspec/specs/{ensure-tests,openspec-workspace-gates,pdca-review-orchestration}/` rename + delta merge; archive of this change.
- **Docs**: `AGENTS.md` naming section + `docs/generated/skills-index.md` (regenerate).
- **Risk**: medium — few renames, high fan-out of string references; mitigated by full-repo grep zero-hit on old ids before merge.
