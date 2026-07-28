## Why

AI-assisted implementation has lowered the cost of writing code that "works." External research (MaintainCoder / AI code-review literature / architecture-review vs code-review practice) converges on the same gap: local correctness is cheap; long-term maintainability and architectural coherence are the scarce goods. This repo's `code-design-review` and `solution-review` already have rich frameworks, but their **non-blocking** rules still treat "a superior architecture exists, yet near-term maintainability is OK" as deferrable — which underweights architecture when rewriting is cheap.

## What Changes

- Raise weight of architectural elegance and **long-term** maintainability in `code-design-review` (Why premise, Layer B default depth, blocking/non-blocking)
- Recalibrate `solution-review` cost-vs-value and non-blocking rules so low implementation cost does not excuse a clearly weaker long-term design when a better alternative is identified
- Thin-sync the four PDCA workflows' review-stage pointers so they do not restate outdated non-blocking lists
- **Non-goal (backlog)**: architecture fitness functions / new standalone architecture skill / learn-and-improve Act prompts

## Capabilities

### New Capabilities

- `code-design-review`: behavioral contract for code-design review weight and gates (first main-spec landing for this skill)
- `solution-review`: behavioral contract for decision-level review weight and gates (first main-spec landing for this skill)

### Modified Capabilities

- `workflow-contract-sync`: workflows that invoke the two review skills MUST defer blocking/non-blocking to those skills and MUST NOT keep soft "near-term OK → defer better architecture" as workflow-local non-blocking guidance

## Impact

- `skills/code-design-review/` (SKILL.md + reference.md)
- `skills/solution-review/` (SKILL.md + reference.md if present)
- Thin pointers: `solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, `opsx-jira-fix-workflow`
- OpenSpec main specs for the two review skills + workflow-contract-sync delta
