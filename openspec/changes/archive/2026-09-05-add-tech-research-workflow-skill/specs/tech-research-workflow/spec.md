# Delta spec: tech-research-workflow

## ADDED Requirements

### Requirement: The skill SHALL run research in a three-step order before any design conclusion

The skill MUST order its methodology as: (1) self business audit, (2) competitor first-hand research, (3) design mapping — and MUST treat design conclusions produced before steps 1–2 exist as a signal that the research skipped a step, surfacing that risk to the user instead of proceeding silently.

#### Scenario: Design-first input arrives

- **WHEN** the user arrives with a trend article or a pre-formed design and asks for a research report
- **THEN** the skill runs the self business audit and competitor research steps first and explicitly reports what the pre-formed design assumed that those steps confirmed or contradicted

### Requirement: Self business audit SHALL produce an asset/hazard inventory with code-level evidence

The self business audit MUST cover business positioning (who produces/consumes the content or capability), decision-maker principles and scope boundaries, and an engineering inventory of the product's own codebase that records both reusable assets and hazards (existing risky patterns that become hard constraints), each pinned with file:line references, plus explicit goals and non-goals.

#### Scenario: Audit feeds design constraints

- **WHEN** the design-mapping step recommends an approach
- **THEN** each hard constraint it cites is traceable to an audit inventory entry (asset or hazard) with a file:line location or is labeled as an assumption needing verification

### Requirement: Competitor research SHALL privilege first-hand runtime evidence over second-hand narratives

Competitor research MUST treat shipped, running competitor features as the primary evidence source (runtime forensics: structure/attribute extraction, resource-supply analysis, response probing, isolation/sandbox probes, and code/network views) and MUST relegate articles and announcements to lead-generation. It MUST also include evolution-curve positioning (distinguishing end-state designs from transitional ones) and same-track incident search (CVEs/security advisories/postmortems of same-category products) when the research topic carries security or platform risk.

#### Scenario: Second-hand source conflicts with first-hand observation

- **WHEN** a vendor article claims a capability the runtime probe does not reproduce
- **THEN** the report records the first-hand observation as authoritative, notes the discrepancy, and cites the article only as a lead

### Requirement: Design mapping SHALL classify every borrowed competitor element into exactly one of three tiers with rationale

The design-mapping step MUST assign each candidate competitor design element to one of: copy (adopt as-is, near-zero marginal cost), copy-the-idea (adopt the concept, keep an upgrade path, adapt the implementation), or explicitly-not-copy (reject with a stated reason tied to the business audit). Every mapping entry MUST carry recommendation + rationale + alternative; no examined element is left unclassified.

#### Scenario: Mapping table completes

- **WHEN** the design-mapping step finishes
- **THEN** every competitor design element examined during research appears in the mapping table with its tier, rationale, and alternative — zero unclassified elements

### Requirement: The first report version SHALL be treated as a constraint probe with an expected pushback

The skill MUST frame the first version of the research report as a probe whose value is surfacing real constraints (missing business context, competitor blind spots), MUST anticipate at least one review pushback, and MUST route pushback findings back into the step whose assumptions failed (business audit or competitor research) rather than only patching the report text.

#### Scenario: Reviewer pushes back on scope

- **WHEN** a reviewer rejects the first version for a scope or stance assumption (e.g. over-defensive posture where industry norm is lighter)
- **THEN** the skill re-opens the failed step's assumptions, re-runs the minimal necessary research, and records what changed and why before rewriting the report

### Requirement: Evidence standards SHALL bind every claim to reproducible evidence

Every non-trivial claim in the report family MUST be bound to evidence with a declared tier: first-hand runtime observation, first-hand code reading (file:line), or second-hand source (link + date). The report family MUST include a reproducible-evidence section that lets a reader re-run the key probes and reach the same observations.

#### Scenario: Report carries an evidence appendix

- **WHEN** a report in the family is finalized
- **THEN** it contains a reproducible-evidence section listing each key claim, its evidence tier, its location (observation steps, file:line, or link+date), and how to reproduce it

### Requirement: A lean tailoring path SHALL exist for single-question research

The skill MUST provide a tailoring path that compresses the flow for small, single-question research (one bounded question, one targeted first-hand check, a one-page answer with evidence links) while preserving the evidence standards; the full staged flow is reserved for design-shaping research.

#### Scenario: Small question routes to the lean path

- **WHEN** the user asks a single bounded question (e.g. "does Competitor A's preview isolate third-party content?") needing one first-hand check
- **THEN** the skill runs the lean path and returns a one-page evidence-linked answer instead of the full staged flow

### Requirement: The report family SHALL be layered with distinct layers carrying distinct depth

The skill MUST guide a layered report family: an architecture/decision main document, detail documents per implementation area, an evidence compendium, a summary layer, a one-page decision memo, and a review agenda classifying items into decisions-needing-approval / confirmations / must-test items; doc-pipeline mechanics (format conversion, test-sample triples) live in reference material, and layer count shrinks under the lean tailoring path.

#### Scenario: Review agenda drives the review meeting

- **WHEN** the review meeting runs from the report family
- **THEN** its agenda separates decision items, confirmation items, and must-test items so approvals and verification obligations are tracked separately

### Requirement: The skill SHALL abort when its declared dependency is missing

The skill frontmatter MUST declare `dependencies: [effective-web-research]`, and on load the skill MUST verify that dependency is available; when missing, it MUST abort with the install command instead of silently degrading its external-search discipline.

#### Scenario: Dependency missing at load

- **WHEN** the skill loads in an environment where `effective-web-research` is not installed
- **THEN** the skill aborts with a message naming the missing dependency and its install command
