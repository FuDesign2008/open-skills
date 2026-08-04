## ADDED Requirements

### Requirement: Write-workflow strongly depends on both humanizer skills

`write-workflow` frontmatter `dependencies` MUST include `humanizer` and `humanizer-zh` in addition to existing dependencies. Missing either MUST abort startup with an install hint (no silent degrade).

#### Scenario: Missing humanizer-zh aborts write-workflow

- **WHEN** `humanizer-zh` is not installed
- **THEN** write-workflow prints a missing-dependency notice and does not proceed

### Requirement: Write-workflow routes humanize requests by language

Stage 1 route table MUST list AI de-slop / humanize as shipped writers. For primarily Chinese source text, stage 6 MUST load `humanizer-zh`; for primarily English source text, stage 6 MUST load `humanizer`. Ambiguous language → ask one clarifying question (clarifying-question-discipline).

#### Scenario: Chinese text routes to humanizer-zh

- **WHEN** the user requests humanize on a Chinese document via write-workflow
- **THEN** stage 6 delegates to `humanizer-zh`

### Requirement: Humanizer writers use input confirmation instead of tech-review §1 gate

Host auto/manual hard-pause rules for `tech-review-doc` §1 MUST remain. For `humanizer` / `humanizer-zh`, the host MUST require a confirmed input (path or pasted text) before rewrite, and MUST NOT apply the tech-review §1 background-approval gate.

#### Scenario: Humanizer path does not require §1 business-goals approval

- **WHEN** write-workflow routes to humanizer or humanizer-zh
- **THEN** the agent does not block on tech-review §1 background confirmation
