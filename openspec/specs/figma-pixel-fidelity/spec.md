# figma-pixel-fidelity Specification

## Purpose

Behavioral contract for open-skills Figma pixel fidelity: two user-invocable skills (`figma-pixel-implement` and `figma-pixel-verify`) that split export-faithful implementation + design-spec contract from measured runtime alignment. Opt-in to host workflows; platform-agnostic tool intent.

## Requirements

### Requirement: figma-pixel-fidelity SHALL ship two user-invocable skills with split duties

open-skills MUST provide two installable skills: `figma-pixel-implement` (pixel-aligned implementation from Figma) and `figma-pixel-verify` (runtime alignment check). Implement MUST NOT claim pixel alignment is complete. Verify MAY claim pass or fail only with fresh measurement or explicitly labeled residual evidence. Both skill bodies MUST be English; frontmatter `description` MUST include Chinese trigger phrases and stay within the project description length limit.

#### Scenario: Implement refuses completion claim

- **WHEN** an agent finishes `figma-pixel-implement` for a Figma node
- **THEN** it MUST produce or update a design-spec table (or equivalent artifact) and MUST NOT state that pixel alignment is verified complete without running `figma-pixel-verify` (or an equivalent measured check the user accepts)

#### Scenario: Verify can run independently

- **WHEN** the user invokes alignment checking without a prior implement run in the same session
- **THEN** `figma-pixel-verify` MUST either consume an existing design-spec table or extract a minimal spec for the named Figma node before measuring

### Requirement: figma-pixel-implement SHALL obtain Figma design context via a platform-agnostic channel

Before writing UI code for a Figma node, `figma-pixel-implement` MUST obtain structured design context through whatever Figma design-context / MCP (or equivalent) tools the current Agent exposes. If an Agent-native Figma→code guidance skill is present, the implement skill SHOULD load it for URL parsing / Code Connect / adaptation hygiene. Absence of any particular product skill id (including Cursor plugin `figma-design-to-code`) MUST NOT by itself abort implement when design-context tools are available. If Figma design-context tools are unavailable, the skill MUST stop and instruct the user how to enable them using platform-agnostic intent (MUST NOT hardcode a single stdio install snippet as the only path; MUST NOT require a Cursor-only skill name on Claude Code, OpenCode, or other Agents).

#### Scenario: MCP unavailable aborts implement

- **WHEN** Figma design-context tools are not available in the session
- **THEN** the agent MUST NOT invent UI from a screenshot alone and MUST tell the user to connect Figma MCP (or equivalent) before continuing

#### Scenario: Missing Cursor design-to-code skill does not block other Agents

- **WHEN** the Agent has Figma design-context MCP tools but no skill named `figma-design-to-code`
- **THEN** `figma-pixel-implement` MUST proceed with MCP design-context + this skill’s fidelity rules rather than aborting for a missing Cursor-specific skill id

#### Scenario: Large frames are decomposed

- **WHEN** design-context output is truncated or the frame is too large
- **THEN** the agent MUST use metadata/outline tools to map child nodes and fetch design context per major child rather than guessing from a partial payload

### Requirement: figma-pixel-implement SHALL enforce export-faithful assets and ban mask recolor pipelines

For icons and images taken from Figma, implement MUST download or otherwise commit exported asset bytes into the project (or wire to an approved dynamic source). The skill MUST forbid hand-authored SVG/path placeholders, CSS `mask` (+ background fill) used to recolor exported glyphs, and rewriting export fills to `currentColor` solely to theme-follow when that changes the designed appearance. Dark/multi-theme needs MUST prefer a second exported asset set over mask-based theming.

#### Scenario: Mask-based icon rendering is forbidden

- **WHEN** implementing an icon that was exported from Figma
- **THEN** the agent MUST render it via an image (or export-preserving SVG component) with explicit sizes and MUST NOT use CSS `mask` + `currentColor` as the delivery path

#### Scenario: Theme convenience does not override fidelity

- **WHEN** the project wants icons to follow dark theme colors but only a light-frame export exists
- **THEN** the agent MUST either use a design-provided dark export or record an explicit pending item—MUST NOT invent a mask recolor pipeline to “make it theme”

### Requirement: figma-pixel-implement SHALL produce a design-spec table mapped to project tokens

Implement MUST build a design-spec table (element × property × Figma exact value × repo token/class × source component) using structured Figma data (variables/defs and metadata as applicable). Screenshot output MUST be treated as visual reference only—MUST NOT be the sole source of numeric values. Unbound one-off values SHOULD be flagged; hardcoded literals MUST NOT be preferred when a project token exists.

#### Scenario: Spec table accompanies implementation

- **WHEN** implement completes a component or screen slice
- **THEN** a design-spec table covering the changed visual properties MUST be available for `figma-pixel-verify`

### Requirement: figma-pixel-verify SHALL measure the running UI against the spec

`figma-pixel-verify` MUST compare the live rendered UI to the design-spec table using numeric reads from the running page (e.g. computed style and box metrics) when a JS-eval channel exists, plus optional side-by-side screenshot comparison. Pass/fail reporting MUST classify rows (at least distinguishing match, wrong token/drift, hardcoded literal, wrong variant/state, and missing element). Geometric comparisons MUST apply an explicit tolerance (e.g. about ±1px for box/spacing); colors, weights, and radii MUST compare exactly unless the skill documents a different rule. The loop MUST be bounded (about three fix/re-measure iterations unless the user raises the cap).

#### Scenario: Numeric pass detects spacing drift

- **WHEN** the spec requires an 8px gap and the running UI measures 12px
- **THEN** verify MUST report a non-pass row with the measured delta and MUST NOT mark overall alignment as passed

#### Scenario: No eval channel degrades honestly

- **WHEN** no channel can evaluate JavaScript in the running app
- **THEN** verify MUST NOT claim a full numeric pass; it MUST record residuals for unmeasured properties and may use screenshot comparison only with that limitation stated

### Requirement: figma-pixel-fidelity skills SHALL stay platform-agnostic and opt-in to hosts

Skill bodies MUST describe intents (obtain design context, export assets, measure computed styles) and MUST NOT require a single named MCP/CLI as the only implementation. Host workflows such as `solve-workflow` / `opsx-solve-workflow` MUST NOT list these skills as mandatory frontmatter dependencies by default; agents MAY invoke them when Figma UI work is in scope.

#### Scenario: Hosts remain optional consumers

- **WHEN** a user runs solve-workflow for a non-UI bug
- **THEN** missing `figma-pixel-implement` / `figma-pixel-verify` MUST NOT abort that workflow via prerequisite dependency checks

### Requirement: figma-pixel-fidelity SHALL document boundaries with adjacent skills

The skills MUST state that Figma design-context / MCP (plus any Agent-native Figma→code guidance when present) owns structured context retrieval; `design-approval-gate` owns pre-implementation solution approval; `figma-pixel-implement` owns export-faithful implementation + spec table; `figma-pixel-verify` owns post-implementation measured alignment. External “taste” / no-design frontend skills MUST NOT override Figma fidelity when a node URL is in scope. Skill prose MUST remain platform-agnostic and MUST NOT treat a single product’s skill id as universal.

#### Scenario: Approval gate remains distinct

- **WHEN** the user has not approved a solution in manual mode
- **THEN** `design-approval-gate` still applies to production edits; having Figma context MUST NOT by itself satisfy design approval
