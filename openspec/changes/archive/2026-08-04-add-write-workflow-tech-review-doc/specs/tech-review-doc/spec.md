## ADDED Requirements

### Requirement: Tech-review-doc skill generates product-facing review documents

The repository SHALL provide a `tech-review-doc` skill (`user-invocable: true`) that transforms a technical design document into a technical review document aimed at product, QA, and non-deep engineers. The skill directory name and frontmatter `name` MUST be `tech-review-doc`.

#### Scenario: Generate review from design path

- **WHEN** the user supplies a design document path and requests a technical review document
- **THEN** the skill reads the design document and produces a review markdown file using the bundled template rules

### Requirement: English skill body with Chinese triggers

`tech-review-doc` skill body (instructions) MUST be written in English. Frontmatter `description` MUST include Chinese triggers (and MAY include English equivalents) such as 「技术评审文档」「生成评审文档」. The bundled output `template.md` MAY remain Chinese because it is an audience-facing document template.

#### Scenario: Trigger via Chinese phrase

- **WHEN** the user says 「生成技术评审文档」 with a design doc reference
- **THEN** the agent is expected to route to `tech-review-doc` based on description triggers

### Requirement: Section 1 approval hard gate

Before creating or writing the review document file, the skill MUST complete a background-and-goals clarification step, present a §1 draft in business language (no code), and obtain explicit user approval of §1. Until that approval, Steps that write the file or generate later sections MUST NOT run.

#### Scenario: Block file write before §1 approval

- **WHEN** §1 has not been explicitly approved by the user
- **THEN** the skill does not create or overwrite the review document file

#### Scenario: Proceed after §1 approval

- **WHEN** the user explicitly confirms the §1 draft
- **THEN** the skill may generate diagrams, remaining sections, and write the output file

### Requirement: Clarifying questions without external brainstorming skill

§1 clarification MUST use `clarifying-question-discipline` (one question per turn; multi-round until clear). The skill MUST NOT require an external skill named `brainstorming` as a strong dependency.

#### Scenario: One question at a time for §1

- **WHEN** gathering business motivation, success criteria, or Non-Goals for §1
- **THEN** the agent asks a single most critical question, waits for the answer, then continues

### Requirement: Template-based structure and conditional sections

The skill MUST ship `template.md` beside `SKILL.md` and use it as the structural source of truth. Generated documents MUST follow template sections: background/goals, overview diagrams (as needed), optional multi-option comparison, implementation summary, risks/boundaries, optional release/ops, conclusion. §3 (comparison) MUST be skipped when there is no substantive multi-option comparison. §6 (release/ops) MUST be skipped unless rollout or server-side data migration applies.

#### Scenario: Skip empty comparison section

- **WHEN** the design documents only one chosen approach with no alternatives compared
- **THEN** the generated review omits §3 entirely

### Requirement: Output path and naming

The skill MUST write the review file next to the input design document, named `tech-review-{topic}-{YYYY-MM-DD}.md`, where topic is derived from the design title and the date is the generation date.

#### Scenario: Sibling output file

- **WHEN** generation completes successfully
- **THEN** a file matching `tech-review-*-*.md` exists in the same directory as the input design document

### Requirement: Audience language and Mermaid rules

Sections §1–§3 MUST contain no code blocks except Mermaid. Mermaid node labels MUST use business/module names, not class or file names. §4 MAY retain necessary interface/field/table purpose descriptions without dumping code.

#### Scenario: Business-readable early sections

- **WHEN** a non-engineer reader opens §1–§3 of the generated document
- **THEN** those sections explain motivation and collaboration without source-code listings
