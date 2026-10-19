# competitive-research Specification

## Purpose

Behavioral contract for the `competitive-research` skill: layered competitive research (product behavior, interaction boundaries, technical mechanism, and on-demand risk surfaces) that ends in either a lean evidence-tagged answer or a decision-ready report family. Orders a self business audit and competitor research before design mapping.

## ADDED Requirements

### Requirement: The skill id SHALL be competitive-research

The skill directory and frontmatter `name` MUST be `competitive-research`. Callers MUST load that id. The previous id `tech-research-workflow` MUST NOT remain as a directory, a frontmatter `name`, or an alias.

#### Scenario: Old id is absent from active skills and specs

- **WHEN** a reader searches `skills/` and active `openspec/specs/` for `tech-research-workflow`
- **THEN** there is no skill directory and no active spec folder under that id, and `competitive-research` is the skill that provides this behavior

### Requirement: The skill SHALL run research in a three-step order before any design conclusion

The skill MUST order a full research report as: (1) self business audit, (2) competitor research on the layers the question needs, (3) design mapping. It MUST treat a design conclusion produced before steps 1–2 exist as a skipped step, and it MUST surface that risk to the user instead of proceeding silently.

#### Scenario: Design-first input arrives

- **WHEN** the user arrives with a trend article or a pre-formed design and asks for a research report
- **THEN** the skill runs the self business audit and the selected competitor-research layers first and reports what the pre-formed design assumed that those steps confirmed or contradicted

### Requirement: Self business audit SHALL produce an asset/hazard inventory with code-level evidence

The self business audit MUST cover business positioning (who produces and who consumes the capability), decision-maker principles, goals and non-goals, and an engineering inventory of reusable assets and hazards, each asset or hazard pinned with a file:line reference or labeled as an assumption.

#### Scenario: Audit feeds design constraints

- **WHEN** the design-mapping step recommends an approach
- **THEN** each hard constraint it cites traces to an audit inventory entry with a file:line location, or is labeled as an assumption needing verification

### Requirement: Competitor research SHALL select layers and SHALL observe product behavior before mechanism

When the question concerns a result the user can see or operate, competitor research MUST record the user action and the observable result (visibility, movement, prompt, or no change) before it records an implementation mechanism. The mechanism layer MUST describe how that observed behavior is produced and MUST cite the behavior observation it explains. Interaction-boundary checks (repeat the action, step back one level, reach zero, and interact with an already shipped behavior) MUST be included when a behavior is adopted as the target. Security forensics, evolution-curve positioning, and same-track incident search MUST run when the question sits on those surfaces and MUST NOT be required for every question. Shipped, running features MUST be the primary evidence. Articles and announcements MUST be treated as leads.

#### Scenario: User-visible question records behavior before mechanism

- **WHEN** the question is what a competitor does when the user performs an action
- **THEN** the record states the observed user-visible result before any implementation mechanism is used as the behavior to copy

### Requirement: Evidence sources SHALL be graded and human observation SHALL outrank conflicting automation

Each competitor behavior claim MUST name its source as one of: in-person or human observation, automation, or a reported or second-hand account. When automation conflicts with in-person or human observation, the decision MUST use the human observation and MUST record why the automation missed. For a custom-rendered editor with a self-drawn caret or selection, an automated keystroke MUST count only when the caret or focus is shown to be on the target before the key, and the recorded result MUST be what was observed at that target. An automation result of no visible change MUST NOT be the decision source until that check holds, or a human observation confirms the same result.

#### Scenario: Automation and a human observer disagree

- **WHEN** an automated session reports no visible change and a human observer reports a visible change for the same action
- **THEN** the decision uses the human observation and the record states the automation gap

#### Scenario: An automated keystroke lands off the target

- **WHEN** an automated keystroke on a custom-rendered editor changes the document somewhere other than the intended caret
- **THEN** the record does not treat that keystroke as evidence of the target action, and states that the caret was not shown on the target

### Requirement: The mechanism layer SHALL privilege first-hand runtime evidence when it runs

When the mechanism layer runs, it MUST treat first-hand observation of the shipped feature (structure, resources, responses, isolation, and code or network views, as the question requires) as the primary evidence, and it MUST relegate articles to leads. Evolution-curve positioning MUST distinguish end-state designs from transitional ones when that surface is in scope. Same-track incident search MUST run when the topic carries security or platform risk.

#### Scenario: A vendor article conflicts with a runtime probe

- **WHEN** a vendor article claims a capability the runtime probe does not reproduce
- **THEN** the record keeps the first-hand observation as authoritative, notes the discrepancy, and cites the article only as a lead

### Requirement: Design mapping SHALL classify every borrowed competitor element into exactly one of three tiers with rationale

On the full report path, design mapping MUST assign each examined competitor element to one of: copy, copy-the-idea, or explicitly-not-copy. Every entry MUST carry recommendation, rationale, and alternative. An entry MUST cite a constraint from the self business audit or be labeled as an assumption.

#### Scenario: Mapping table completes

- **WHEN** the design-mapping step finishes
- **THEN** every competitor element examined during research appears with its tier, rationale, and alternative

### Requirement: The first report version SHALL be treated as a constraint probe with an expected pushback

On the full report path, the skill MUST treat the first report version as a probe that surfaces missing constraints, MUST anticipate at least one review pushback, and MUST route that pushback to the step whose assumption failed (business audit or competitor research) before rewriting the report.

#### Scenario: Reviewer pushes back on scope

- **WHEN** a reviewer rejects the first version for a scope or stance assumption
- **THEN** the skill re-opens the failed step, re-runs the minimum research that step needs, and records what changed before rewriting the report

### Requirement: Evidence standards SHALL bind every non-trivial claim to a tier and a source

Every non-trivial claim MUST carry an evidence tier (first-hand runtime observation, first-hand code reading with file:line, or second-hand source with link and date) and, for competitor behavior claims, the source grade from the evidence-source requirement. A full report MUST include a reproducible-evidence section that tells a reader how to repeat each key observation.

#### Scenario: Report carries an evidence appendix

- **WHEN** a report in the family is finalized
- **THEN** it lists each key claim with its evidence tier, its source grade when the claim is competitor behavior, its location, and how to reproduce it

### Requirement: A lean layer-selected path SHALL answer a single question

The skill MUST provide a lean path for one bounded question: the layers that question needs, one targeted first-hand check, an evidence-tagged answer, and what was not checked. The lean path MUST keep the evidence-source and evidence-tier rules and MUST drop the report family, design mapping, and reflux loop. A direct request for a research report MUST run the full staged flow.

#### Scenario: A problem-solving host asks one behavior question

- **WHEN** a host loads this skill for one user-visible question
- **THEN** the skill returns the lean layer-selected answer and does not require the report family

### Requirement: The report family SHALL be layered with distinct layers carrying distinct depth

On the full report path, the skill MUST guide a layered report family: an architecture or decision main document, detail documents per area, an evidence compendium, a summary layer, a one-page decision memo, and a review agenda that separates decisions needing approval, confirmations, and must-test items. Document-pipeline mechanics live in reference material. The lean path MUST NOT require this family.

#### Scenario: Review agenda drives the review meeting

- **WHEN** the review meeting runs from the report family
- **THEN** its agenda separates decision items, confirmation items, and must-test items

### Requirement: The skill SHALL abort when effective-web-research is missing

The skill frontmatter MUST declare `dependencies: [effective-web-research]`. On load, a missing dependency MUST abort with the install command. External search MUST follow `effective-web-research`.

#### Scenario: Dependency missing at load

- **WHEN** the skill loads where `effective-web-research` is not installed
- **THEN** the skill aborts with a message naming the missing dependency and its install command

### Requirement: The description SHALL include Chinese triggers for competitive research

The frontmatter `description` MUST include the Chinese triggers 「技术调研」, 「竞品调研」, 「产品调研」, and 「全面调研」, and MUST state that known-defect routing belongs to `known-issue-research` and that a single web lookup without a design or behavior decision belongs to `effective-web-research`.

#### Scenario: A product-research phrase routes here

- **WHEN** the user asks for 产品调研 or 竞品调研 of a shipped feature
- **THEN** the description matches that request to this skill rather than to `known-issue-research`
