# Delta: staged-review-flow

Code-trigger sharpening and long-term-cost depth floor enter the orchestration contract.

## MODIFIED Requirements

### Requirement: Decision-level review SHALL always run solution-review

`staged-review-flow` MUST require a full `solution-review` (core + strategic dimensions per that skill) for every reviewed solution. When the solution involves code changes — writing or modifying source files, including scripts and generated config code — it MUST also run `code-design-review` Layer A/B/C per that skill. For code-affecting solutions, the strategic dimensions that carry long-term cost (cost-vs-value, team cognitive fit) MUST run at least at standard depth, regardless of the solution's reversibility classification. Hosts MUST NOT substitute a shortened four-bullet checklist for `solution-review`.

#### Scenario: opsx-solve aligns with full solution-review

- **WHEN** `opsx-solve-workflow` runs its review stage after this change
- **THEN** the agent runs full `solution-review` via `staged-review-flow`, not only a four-dimension inline list

#### Scenario: Long-term-cost dimensions keep depth on two-way doors

- **WHEN** a code-affecting solution is classified as a two-way door (easily reversible)
- **THEN** the cost-vs-value and team-cognitive-fit dimensions still run at standard depth rather than a quick pass
