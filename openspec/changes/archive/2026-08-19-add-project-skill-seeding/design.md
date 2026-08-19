# Design — add-project-skill-seeding

## Context

Third architecture correction by the user, each moving closer to source fidelity: (1) loop must be a strong gate, (2) merged into one skill, (3) — this change — attribution/optimization knowledge must live as **project-level skills that evolve per campaign**, per the source model (article's code-insight/code-optimizer improved continuously; bulb's project-local attribution skill).

## Goals / Non-Goals

- Goals: seed/evolve contract for `code-insight` + `code-optimizer` in the target project; corpus reframe; loop skill-evolution step.
- Non-Goals: shipping C++ seed chapters (slots only); frontmatter deps on project skills; changing evidence disciplines.

## Decisions

1. **Project skills, not workflow stages, own stack knowledge**: the paradigm file stays cross-stack; per-stack seeds come from the corpus; per-project knowledge accumulates only in the project (where it is used and validated). This matches the article's portability claim ("copy the skills into any project") inverts it correctly: seed once per project, then diverge.
2. **Seed source = reference.md Parts 1/2 (JS today), Part 3 slots for other stacks**: the corpus's role changes from "working knowledge" to "seed + fallback"; before project skills mature, Parts 1/2 still serve directly.
3. **Skill evolution at stop conditions (and ~5-round checkpoints in long loops)**: benchmark-log invalidation rows and negative results are the primary feed — they encode what the skills got wrong; this is the cross-campaign compounding mechanism.
4. **Writing into a target project is a documented deliverable, not a silent default**: invoking the workflow opts into its artifacts (BENCHMARK.md, harness, and now two skills); manual mode confirms the skill location; detection of the project's skill directory is intent-level (no platform enumeration, per repo conventions).
5. **Names keep the source's** (`code-insight` / `code-optimizer`): role names (attribution / optimization), stack-varying content — user explicitly allowed "C++ or JS" under the same names.

## Risks / Trade-offs

- Projects that forbid agent-skill directories → manual-mode confirmation surfaces the conflict; auto mode uses the project's existing convention or stops with a stated blocker.
- Seed quality for non-frontend stacks → slots stay empty until validated (same discipline as the corpus); first C++ campaign seeds from discovery, not from untested prose.
- Skill proliferation in target projects → exactly two fixed-name skills, evolved in place; no per-campaign files.

## Open Questions

None blocking.
