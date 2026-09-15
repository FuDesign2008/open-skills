## ADDED Requirements

### Requirement: Repair comments SHALL use h3/h4 plus numbered list scenarios

Repair comments composed per `jira-wiki-markup` MUST use `h3.` for the report title, `h4.` for the Verification Scenarios section, and numbered list items `# *{scenario_name}*` for each scenario (bold name). Wiki line-start `#` is a numbered list; it MUST be kept as `#` and MUST NOT be rewritten as `h1.` or `h2.` for scenario titles. The skill body MUST state that Wiki `#` is not GitHub Markdown heading 1.

#### Scenario: Scenario titles are numbered list items

- **WHEN** a repair comment includes verification scenarios
- **THEN** each scenario title is a column-0 `# *name*` list item under `h4. Verification Scenarios`, not `h1.` / `h2.` / `h3.` headings

#### Scenario: Dialect trap is stated next to lists

- **WHEN** an agent reads `jira-wiki-markup` composition or `reference.md` Lists / canonical skeleton
- **THEN** the text states that Wiki `#` is a numbered list and GitHub Markdown `#` is heading 1, so list `#` is not rewritten as `h1.`
