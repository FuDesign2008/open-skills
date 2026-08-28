# Proposal: prioritize architecture review weight (layer reorder + contract remediation)

## Why

A user-observed failure ("solve-workflow 审查方案时不给架构设计与长期可维护性更高权重") traced to four root causes, all verified in current main: (RC1) `opsx-solve-workflow` stage-4 still embeds the non-blocking clause "**never** treat 'a better architecture exists but the near-term one is maintainable' as blocking" — a drift that directly violates the archived `workflow-contract-sync` requirement "Workflow review stages SHALL defer architecture-weight gates to review skills" (2026-08-28 grep: sole surviving occurrence repo-wide); (RC2) `solution-review` strategic dimensions that carry long-term cost are depth-downgraded to "quick pass" for two-way doors; (RC3) `code-design-review` presents code-level metrics (Layer A) before architecture attributes (Layer B), so reviewer attention lands on code craft first despite the skill's own AI-era premise demanding higher architecture weight; (RC5) staged-review-flow's "when the solution affects code" trigger is judgment-prone at the boundary (scripts, generated config code).

## What Changes

- **Layer reorder (hard rename)**: `code-design-review` layers reordered by importance — **new Layer A = architecture-level quality attributes** (items renumbered 1–5), **new Layer B = code-level design metrics** (items 6–12), Layer C unchanged (13). Presentation, application steps, output template, and reference.md all lead with architecture. Each layer keeps its own applicability rule (A scales full/quick by scope; B runs for every code change; C on trust boundaries)
- **RC1 remediation**: `opsx-solve-workflow` stage-4 non-blocking clause replaced with a criteria-ownership pointer to `solution-review` / `code-design-review` (aligning with workflow-contract-sync)
- **RC5**: staged-review-flow code-trigger sharpened — "writing or modifying source files, including scripts and generated config code"
- **RC2 depth floor**: staged-review-flow — for code-affecting solutions, strategic dimensions carrying long-term cost (cost-vs-value, team cognitive fit) run at least at standard depth regardless of reversibility
- **Cross-reference hard cut**: 4 hosts' "code-design-review Layer B dependency-direction dimension" pointer → Layer A; description word order flipped (architecture first); versions bumped

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `code-design-review`: layer rename/ordering enters the contract (new ADDED ordering requirement; 2 requirements retitled Layer B→A; scenario references updated)
- `staged-review-flow`: decision-level-review requirement gains the sharpened code trigger and the long-term-cost depth floor
- `workflow-contract-sync`: two requirements' "Layer B" references rename to Layer A

## Impact

- Skills: `code-design-review` (SKILL.md restructure + reference.md reorder, 1.2.0→1.3.0), `staged-review-flow` (1.2.0→1.3.0), `opsx-solve-workflow` (1.18.0→1.18.1), `solve-workflow` (1.24.0→1.24.1), `jira-fix-workflow` (3.27.0→3.27.1), `opsx-jira-fix-workflow` (1.18.0→1.18.1)
- Main specs: code-design-review, staged-review-flow, workflow-contract-sync (synced at archive)
- `git-worktree-discipline/reference.md` owns an unrelated Layer A/B/C vocabulary — explicitly out of scope
- Index regenerated (description flip); no routing/trigger-word changes
