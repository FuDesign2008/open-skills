## Why

Four PDCA workflows still duplicate review orchestration, OpenSpec workspace gates, and thin-reference asides for skills that already have SSOT (`merge-discipline`, `learn-and-improve`, etc.). Host skills stay heavy; changing one gate requires editing multiple workflows. After `analysis-core` extraction, the next lean lever is shared **orchestration** skills plus host thin-ref debt cleanup.

## What Changes

- **Wave 1**: Thin-reference debt cleanup in four PDCA workflows (and merge hosts) — drop Part A–D expansions, learn/clarifying/node probe-chain copy; keep one-line pointers.
- **Wave 2a**: New shared skill `pdca-review-orchestration` — review call contract, pass/fail loop, design summary, verification honesty; workflows thin-ref with placeholders. **Behavior align**: decision-level review MUST run full `solution-review` (including correcting `opsx-solve-workflow`).
- **Wave 2b**: New shared skill `openspec-workspace-gates` — project-root locate, `openspec/` check, OPSX native skill gate; both opsx workflows thin-ref.
- **Wave 2c**: Parameterize `ensure-tests` with `mode=advisory|mandatory`; remove duplicated decision trees from hosts.
- **Deferred (Non-Goals this change)**: `pdca-explore-options`, `jira-difficulty-path`, batch relation orchestration; merging review or debug skill families.

## Capabilities

### New Capabilities
- `pdca-review-orchestration`: Shared PDCA review-stage orchestration (load review skills, binary conclusion, auto/manual loops, design summary, verification honesty, placeholders for intentional divergences).
- `openspec-workspace-gates`: Shared OpenSpec project-root location and OPSX native-skill prerequisite gates for opsx workflows.

### Modified Capabilities
- `workflow-contract-sync`: Host workflows MUST thin-ref the new shared skills; MUST NOT restate merge-discipline Part steps or review blocking lists; ensure-tests invocation MUST declare advisory vs mandatory mode.
- `ensure-tests`: Add `mode=advisory|mandatory` contract for host workflows (advisory = remind/non-blocking; mandatory = fail blocks stage exit).

## Impact

- Skills: four PDCA workflows; `ensure-tests`; new `pdca-review-orchestration` and `openspec-workspace-gates`; AGENTS.md optional one-line if needed after Wave 1.
- Dependencies: workflows gain 1–2 strong deps; `pdca-review-orchestration` depends on `solution-review` + `code-design-review`.
- Docs: `docs/generated/skills-index.md` regenerate.
- Behavior: `opsx-solve-workflow` stage 4 becomes consistent with other workflows on full `solution-review` (intentional tightening, documented in design).
