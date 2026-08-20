# Proposal: arch-boundary-precheck

## Why

A 2026-08-20 cross-process incident (`docs/architecture-boundary-decision-priority.md`) showed both defense lines failing together: the explore-solutions stage of the solve-family workflows picked a solution on short-term-cost grounds (reuse + single-repo change) without checking which process owns the capability's runtime, and the review stage passed it because no checklist item asks that question either — the error surfaced only at real-device verification as a startup crash (circular dependency), costing a full three-MR rework. Neither the solution-exploration dimensions nor `code-design-review` Layer B currently encode "capability runtime ownership" as a checkable fact, so neither selection nor review will ever ask it.

## What Changes

- `code-design-review` Layer B dimension 12 (dependency direction) becomes the single source of truth for architecture-boundary verification and gains checkable sub-items: capability runtime initialization location (which process/layer initializes it), cross-layer import legality (dependency-tree spread into the caller's bundle graph, circular-dependency risk), and capability ownership classification (system capability vs data/product capability vs calling-layer positioning). Includes the general bundler fact that static pre-scanning defeats dynamic `require`/`import` as a circular-dependency workaround.
- Layer B trigger conditions extend to "crosses process or layer boundaries" so boundary-crossing solutions get the full Layer B path.
- The Layer B blocking list gains: a solution whose called capability has no runtime in the caller's process/layer (or whose cross-layer import pulls an unrelated dependency tree into the caller) is blocking unless explicitly accepted as Prudent-Deliberate debt.
- All four solve-family hosts (`solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, `opsx-jira-fix-workflow`) add a thin (~2 lines each) decision-order rule at their explore-solutions stage: when a candidate crosses process/layer boundaries, the architecture-boundary precheck MUST be answered before weighing short-term costs (change size / reuse / single-repo); the checkable item names are inlined, methodology references `code-design-review` Layer B dimension 12; the boundary verdict surfaces with the solution comparison table.
- `solution-review` is intentionally untouched (dimension 8 already carries long-term maintenance cost and the structural-alternative blocking rule).

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `workflow-contract-sync`: new family-wide requirement — the solve-family explore-solutions stage MUST run the architecture-boundary precheck (decision order: boundary before short-term cost) for cross-process/cross-layer candidates, with a thin reference into `code-design-review` Layer B as methodology SoT and the boundary verdict surfaced with the comparison table.
- `code-design-review`: Layer B trigger extension + dimension 12 checkable sub-items (runtime ownership / boundary legality / ownership classification / bundler pre-scan fact) + a blocking criterion for runtime-ownership violations.

## Impact

- Files: `skills/code-design-review/SKILL.md` + `skills/code-design-review/reference.md`; `skills/solve-workflow/SKILL.md`, `skills/opsx-solve-workflow/SKILL.md`, `skills/jira-fix-workflow/SKILL.md`, `skills/opsx-jira-fix-workflow/SKILL.md` (thin references only).
- Version bumps (MINOR) for the four affected skills; `docs/generated/skills-index.md` regenerated via pre-commit or `node scripts/gen-skill-docs.mjs`.
- No frontmatter `dependencies` changes; no description/trigger-word changes; no new skills; `solution-review` untouched.
- Case-study doc `docs/architecture-boundary-decision-priority.md` remains as incident reference (its §4.1 asks are satisfied by this change).
