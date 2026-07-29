## Why

Waves 1–3 closed clarifying, evidence, dual-axis review, red-loop, glossary, test-first, design-approval, and branch closeout. Remaining high-value gaps are (M5) no decision-fog map before solution exploration when the path is still unclear across turns, and (S5) no optional workspace isolation before execution—closeout only mentions cleanup. Closing them without re-depending on Matt Wayfinder or Superpowers worktrees keeps exploration and isolation consistent across PDCA hosts.

## What Changes

- Add shared skill `decision-fog-discipline` (M5): destination → decision tickets → fog graduation before stage-3 solution exploration / OpenSpec proposal; reuse clarifying-question-discipline for HITL asks; no Matt tracker hard dependency.
- Add shared skill `workspace-isolation-discipline` (S5): optional isolated workspace before execution (detect existing → consent → git worktree or platform equivalent); lean/hotfix may stay in-place with 留痕; destruction remains optional via `feature-branch-closeout`.
- Thin pointers / dependencies on four PDCA hosts.
- **Naming constraint**: MUST NOT use `wayfinder` or `using-git-worktrees`.
- **Out of scope**: R1 host reference.md lean cleanup (later wave).

## Capabilities

### New Capabilities

- `decision-fog-discipline`: decision-fog map / tickets / graduation gate; English body + Chinese triggers.
- `workspace-isolation-discipline`: optional pre-exec workspace isolation lifecycle (create/detect); English body + Chinese triggers.

### Modified Capabilities

- `feature-branch-closeout`: clarify optional cleanup composes with workspace-isolation-discipline (destroy side only; does not own create).

## Impact

- New: `skills/decision-fog-discipline/`, `skills/workspace-isolation-discipline/`
- Edit: four PDCA hosts, `feature-branch-closeout` (composition sentence), `AGENTS.md` table, skills index
