## Why

The paradigm's knowledge architecture deviated from the source model: attribution/optimization pipelines were runtime stages with knowledge parked in the global reference.md — losing the source campaigns' core compounding mechanism (KM article: skills-as-code improved by Agent Teams each campaign; bulb: `.claude/skills/code-insight/` accumulated project-specific attribution knowledge). User ruling: the workflow must seed `code-insight` + `code-optimizer` as project-level skills (stack-varying: C++ or JS), and continuously evolve them as the project's optimization work proceeds. Project-specific knowledge should live where it is used and grow with every campaign.

## What Changes

- `perf-optimize-workflow` Stage 2 (Locate): probe for the project's `code-insight` skill — found → run its pipeline and note gaps; not found → seed it from the matching reference.md stack chapter plus this run's project discoveries (manual mode confirms location; auto mode uses the project's agent-skill convention)
- Stage 5 (Optimize): same lifecycle for `code-optimizer`
- Iteration-loop section gains **Skill evolution**: at every stop condition (or every ~5 rounds in long loops), fold validated lessons — attribution patterns that worked, rejected optimizations with data, stack pitfalls, benchmark-log invalidation rows — back into the two project skills in place
- Layered-architecture table rebuilt: paradigm (this file, stable) → project skills (living, per-campaign) → stack corpus (reference.md, seed + case archive, occasional refresh)
- `reference.md` reading guide reframed: Parts 1/2 are seed material for JS-stack projects' skills (usable directly before they mature); Part 3 slots become seed slots; Part 4 case archive stays paradigm-level
- **Non-goals**: shipping ready-made C++ seed chapters (slots stay empty until validated); frontmatter dependencies on project skills (they are runtime artifacts, not installable deps); changing the nine evidence disciplines

## Capabilities

### Modified Capabilities

- `perf-optimize-workflow`: new Requirement — seed and evolve project-level `code-insight`/`code-optimizer`; MODIFIED knowledge-layer requirement — living knowledge moves from reference.md to the project skills, reference.md becomes seed corpus

## Impact

- Modified: `skills/perf-optimize-workflow/SKILL.md` (description, layered table, Scope, Stage 2/5 subsections, loop skill-evolution), `skills/perf-optimize-workflow/reference.md` (reading guide), `openspec/specs/perf-optimize-workflow/spec.md` after archive
- Behavior: first campaign in a project creates two skill files in the project's skill directory (deliverables of invoking the workflow, alongside BENCHMARK.md/harness); later campaigns use and improve them
- Risk: writing into a target project's skill directory — mitigated by manual-mode location confirmation and the workflow's documented contract (invoking 性能优化 opts into its deliverables); platform-location detection is intent-level per repo conventions (no platform enumeration)
