## ADDED Requirements

### Requirement: solution-review cost-vs-value SHALL account for cheap implementation and expensive maintenance

When assessing cost vs value, `solution-review` MUST NOT treat low implementation effort (including AI-assisted coding) as sufficient value justification for a structurally weaker design. The assessment MUST weigh expected long-term maintenance / change-amplification cost against short-term delivery speed.

#### Scenario: Cheap to build, expensive to evolve fails cost-value

- **WHEN** two feasible options exist and the cheaper-to-implement option clearly increases long-term change amplification or coupling without a documented repayment plan
- **THEN** cost-vs-value MUST NOT pass solely because implementation is fast; the review flags the long-term cost and treats an unmitigated material gap as blocking for one-way or high-impact decisions (and as blocking for code-affecting solutions when paired with `code-design-review` architecture findings)

### Requirement: Non-blocking elegance deferral SHALL require long-term adequacy, not near-term only

`solution-review` MUST NOT treat "a more elegant approach exists, but the current one is correct and maintainable" as non-blocking when the elegance gap is architectural / structural and materially affects long-term maintainability. Style-level elegance without structural impact may remain non-blocking.

#### Scenario: Structural elegance gap is not style

- **WHEN** the alternative is a clearer module boundary or dependency direction that reduces future change radius, and it is feasible now
- **THEN** the gap is not classified as a mere elegance preference; it is assessed as a maintainability / design-risk issue (blocking when unmitigated and material)
