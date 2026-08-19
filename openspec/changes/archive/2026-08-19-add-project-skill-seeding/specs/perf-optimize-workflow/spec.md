## ADDED Requirements

### Requirement: The workflow SHALL seed and evolve project-level code-insight and code-optimizer skills

The Locate stage MUST probe for a project-level attribution skill (`code-insight`) and the Optimize stage for a project-level optimization skill (`code-optimizer`), both living in the target project's conventional agent-skill directory (detected by convention; manual mode confirms the location before writing). On first campaign with a skill absent, the workflow MUST seed it from the matching stack chapter of the `reference.md` corpus plus this run's project discoveries (tool paths, workload specifics, known pitfalls). On later campaigns it MUST run the existing skill's pipeline and record gaps as improvement candidates. At every iteration-loop stop condition (and at least every ~5 rounds in long loops), the workflow MUST fold validated campaign lessons — attribution patterns that worked, rejected optimizations with their data, stack/project pitfalls, benchmark-log invalidation rows — back into the two skills in place.

#### Scenario: First campaign seeds the skills

- **WHEN** the workflow enters the Locate stage in a project with no `code-insight` skill
- **THEN** it seeds the skill from the matching stack chapter plus this run's project discoveries, confirming the location in manual mode

#### Scenario: Campaign lessons evolve the skills

- **WHEN** the iteration loop hits a stop condition
- **THEN** this campaign's validated attribution patterns, rejected optimizations (with data), and stack pitfalls are folded into `code-insight` / `code-optimizer` in place, so the next campaign starts smarter

#### Scenario: Seeded skill works standalone

- **WHEN** a later session on the same project faces an attribution task without this workflow running
- **THEN** the project's `code-insight` skill is invocable on its own as a standing project asset

## MODIFIED Requirements

### Requirement: Knowledge layer isolation

Stack- and project-specific knowledge MUST live in the target project's `code-insight` / `code-optimizer` skills (seeded and evolved by this workflow), not in `SKILL.md`; `SKILL.md` MUST stay paradigm-only. `reference.md` MUST carry the seed corpus (per-stack chapters with extension slots) and the evidence case archive, refreshed via knowledge-only changes. The project skills are the living knowledge layer; the corpus only needs occasional refresh.

#### Scenario: Knowledge accumulates in the project

- **WHEN** a campaign discovers a project-specific attribution pattern or a rejected optimization
- **THEN** the knowledge lands in the project's `code-insight` / `code-optimizer` skill, while `SKILL.md` stays unchanged and the `reference.md` corpus stays seed-only

#### Scenario: Knowledge refresh without contract change

- **WHEN** a framework version table in the corpus is outdated
- **THEN** updating it does not alter any requirement in this spec
