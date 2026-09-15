# figma-pixel-fidelity Specification

## Purpose

Behavioral contract for open-skills Figma pixel fidelity: two user-invocable skills (`figma-pixel-implement` and `figma-pixel-verify`) that split export-faithful implementation + design-spec contract from measured runtime alignment. PDCA hosts strong-depend on both; invoke under Figma-scope conditions; platform-agnostic tool intent.
## Requirements
### Requirement: figma-pixel-fidelity SHALL ship two user-invocable skills with split duties

open-skills MUST provide two installable skills: `figma-pixel-implement` (pixel-aligned implementation from Figma) and `figma-pixel-verify` (runtime alignment check). Implement MUST NOT claim pixel alignment is complete. Verify MAY claim pass or fail only with fresh measurement or explicitly labeled residual evidence. Both skill bodies MUST be English; frontmatter `description` MUST include Chinese trigger phrases and stay within the project description length limit.

#### Scenario: Implement refuses completion claim

- **WHEN** an agent finishes `figma-pixel-implement` for a Figma node
- **THEN** it MUST produce or update a durable living spec in the target repo (Inventory + Spec) and MUST NOT state that pixel alignment is verified complete without running `figma-pixel-verify` (or an equivalent measured check the user accepts)

#### Scenario: Verify can run independently

- **WHEN** the user invokes alignment checking without a prior implement run in the same session
- **THEN** `figma-pixel-verify` MUST either consume an existing living spec on disk or persist a minimal spec for the named Figma node before measuring

### Requirement: figma-pixel-implement SHALL obtain Figma design context via a platform-agnostic channel

Before writing UI code for a Figma node, `figma-pixel-implement` MUST obtain structured design context through whatever Figma design-context / MCP (or equivalent) tools the current Agent exposes. If an Agent-native Figma→code guidance skill is present, the implement skill SHOULD load it for URL parsing / Code Connect / adaptation hygiene. Absence of any particular product skill id (including Cursor plugin `figma-design-to-code`) MUST NOT by itself abort implement when design-context tools are available. If Figma design-context tools are unavailable, the skill MUST stop and instruct the user how to enable them using platform-agnostic intent (MUST NOT hardcode a single stdio install snippet as the only path; MUST NOT require a Cursor-only skill name on Claude Code, OpenCode, or other Agents).

#### Scenario: MCP unavailable aborts implement

- **WHEN** Figma design-context tools are not available in the session
- **THEN** the agent MUST NOT invent UI from a screenshot alone and MUST tell the user to connect Figma MCP (or equivalent) before continuing

#### Scenario: Missing Cursor design-to-code skill does not block other Agents

- **WHEN** the Agent has Figma design-context MCP tools but no skill named `figma-design-to-code`
- **THEN** `figma-pixel-implement` MUST proceed with MCP design-context + this skill’s fidelity rules rather than aborting for a missing Cursor-specific skill id

#### Scenario: Large frames are decomposed completely

- **WHEN** design-context output is truncated or the frame is too large
- **THEN** the agent MUST use metadata/outline tools to map visible child sections and fetch design context for each major child
- **AND** implement MUST treat any unfetched visible section as incomplete — MUST NOT mark implement complete from a sampled subset

### Requirement: figma-pixel-implement SHALL enforce export-faithful assets and ban mask recolor pipelines

For icons and images taken from Figma, implement MUST download or otherwise commit exported asset bytes into the project (or wire to an approved dynamic source). The skill MUST forbid hand-authored SVG/path placeholders, CSS `mask` (+ background fill) used to recolor exported glyphs, and rewriting export fills to `currentColor` solely to theme-follow when that changes the designed appearance. Dark/multi-theme needs MUST prefer a second exported asset set over mask-based theming.

#### Scenario: Mask-based icon rendering is forbidden

- **WHEN** implementing an icon that was exported from Figma
- **THEN** the agent MUST render it via an image (or export-preserving SVG component) with explicit sizes and MUST NOT use CSS `mask` + `currentColor` as the delivery path

#### Scenario: Theme convenience does not override fidelity

- **WHEN** the project wants icons to follow dark theme colors but only a light-frame export exists
- **THEN** the agent MUST either use a design-provided dark export or record an explicit pending item—MUST NOT invent a mask recolor pipeline to “make it theme”

### Requirement: figma-pixel-implement SHALL inventory screens and visual states before the spec table

Before building the design-spec table, implement MUST record a screen × state inventory sourced from the design (frame/section names, component variant names, prototype reactions that map to visual states). Visual states present on the canvas (default, hover, pressed, disabled, selected, or equivalently named variants) MUST appear as inventory entries. Prototype or product behaviors that are not computed-style properties (window drag, auto-follow scroll, mouse-wheel paging) MUST still be listed and labeled `out-of-scope: behavior`. The agent MUST NOT invent hover or other states that the design does not document.

#### Scenario: Inventory precedes spec rows

- **WHEN** implement starts from a Figma node that includes a default frame and a Hover variant on a chip
- **THEN** the inventory lists at least default and hover for that chip before any design-spec table rows are written

#### Scenario: Undocumented hover is not invented

- **WHEN** the design has no Hover/Pressed variant and no prototype reaction for a control
- **THEN** implement records `no-variant-in-design` for that control and MUST NOT invent hover colors or sizes

#### Scenario: Behavior items are labeled not pixel-claimed

- **WHEN** the design or product includes auto-follow scroll or window-drag that cannot be expressed as a computed-style row
- **THEN** the inventory lists the item as `out-of-scope: behavior` and implement MUST NOT claim pixel alignment for it

### Requirement: figma-pixel-implement SHALL treat the Figma node as visual source of truth

Numeric and type values in the spec table MUST come from the structured design payload for the named node. When a walkthrough, QA note, or comment conflicts with the current Figma node, implement MUST keep the Figma value in `expected` and record the conflict as a residual or note — MUST NOT silently override the file to match the note.

#### Scenario: QA font-weight conflicts with the node

- **WHEN** a walkthrough says title `font-weight: 400` and the Figma text style on the named node is Medium 500
- **THEN** the spec table `expected` is 500 and the conflict is recorded; implement does not change expected to 400 to match the walkthrough

### Requirement: figma-pixel-implement SHALL persist a living spec in the target repo

Implement MUST write Inventory and Spec sections to a durable path in the **target** codebase. Prefer an existing project Figma/design-spec directory; otherwise `docs/figma/<safe-frame-name>.md`. Default layout is one file with Inventory, Spec, and an empty Verify section. As each visible child section is implemented, implement MUST append matching inventory/spec rows. A session-only table MUST NOT count as complete. Hand-off MUST include the file path.

#### Scenario: Session note is not complete

- **WHEN** implement has code and a chat-only spec table but no target-repo file path
- **THEN** implement is incomplete and MUST NOT claim ready for verify

#### Scenario: Rows append per visible section

- **WHEN** a large frame has Welcome and Composer sections and Welcome is implemented first
- **THEN** the living artifact already contains Welcome inventory/spec rows before Composer is finished

### Requirement: figma-pixel-implement SHALL produce a design-spec table mapped to project tokens

Implement MUST build a design-spec table (element × property × Figma exact value × repo token/class × source component) using structured Figma data (variables/defs and metadata as applicable). The table MUST live in the target-repo living artifact (Spec section). Each row MUST include `state` (visual state from the inventory), `mode` when theme is in scope, and **measurement basis** (which parent or sibling the number is relative to — for example gap from header bottom, not only the node’s own padding). Screenshot output MUST be treated as visual reference only—MUST NOT be the sole source of numeric values. Unbound one-off values SHOULD be flagged; hardcoded literals MUST NOT be preferred when a project token exists.

#### Scenario: Spec table accompanies implementation

- **WHEN** implement completes a component or screen slice
- **THEN** a design-spec table covering the changed visual properties MUST be on disk in the living artifact for `figma-pixel-verify`

#### Scenario: Spacing rows name the basis

- **WHEN** a walkthrough or design specifies distance from a named sibling (for example title to 顶部模块)
- **THEN** the spec row records that sibling as `basis` and the Figma-derived expected value for that relationship

### Requirement: figma-pixel-verify SHALL measure the running UI against the spec

`figma-pixel-verify` MUST compare the live rendered UI to the design-spec table using numeric reads from the running page (e.g. computed style and box metrics) when a JS-eval channel exists, plus optional side-by-side screenshot comparison. Pass/fail reporting MUST classify rows (at least distinguishing match, wrong token/drift, hardcoded literal, wrong variant/state, and missing element). Geometric comparisons MUST apply an explicit tolerance (e.g. about ±1px for box/spacing); colors, weights, and radii MUST compare exactly unless the skill documents a different rule. The loop MUST be bounded (about three fix/re-measure iterations unless the user raises the cap). Overall PASS additionally requires the unmeasured-critical-row rule (`figma-pixel-verify SHALL fail overall when critical inventory rows are unmeasured`).

#### Scenario: Numeric pass detects spacing drift

- **WHEN** the spec requires an 8px gap and the running UI measures 12px
- **THEN** verify MUST report a non-pass row with the measured delta and MUST NOT mark overall alignment as passed

#### Scenario: No eval channel degrades honestly

- **WHEN** no channel can evaluate JavaScript in the running app
- **THEN** verify MUST NOT claim a full numeric pass; it MUST record residuals for unmeasured properties and may use screenshot comparison only with that limitation stated

### Requirement: figma-pixel-fidelity skills SHALL stay platform-agnostic and strong-depend from PDCA hosts

Skill bodies MUST describe intents (obtain design context, export assets, measure computed styles, persist and update the living artifact) and MUST NOT require a single named MCP/CLI as the only implementation. Host workflows `solve-workflow`, `opsx-solve-workflow`, `jira-fix-workflow`, and `opsx-jira-fix-workflow` MUST list both `figma-pixel-implement` and `figma-pixel-verify` in frontmatter `dependencies`. At host startup prerequisite check, a missing either skill MUST abort (no silent degrade). Hosts MUST load `figma-pixel-implement` during execution when the task includes a Figma URL/node or pixel-restore / design-faithful UI intent; implement is incomplete without a durable inventory+spec path. When this run implemented from Figma, hosts MUST load `figma-pixel-verify` during verification and MUST treat a missing Verify section (or named Spec source sibling) as a failed verification stage. A spec-gap FAIL MUST NOT pass verification—the host re-enters implement to complete the table. Hosts MUST also load verify when the user/plan requires alignment checking without a same-run implement. Pure non-UI work MUST still pass the install-time prerequisite check but MUST NOT be forced to run implement/verify loops. Host prose MUST stay thin and MUST NOT duplicate Figma skill methodology.

#### Scenario: Missing Figma pixel skill aborts host startup

- **WHEN** a listed PDCA host loads and `figma-pixel-implement` or `figma-pixel-verify` is not available
- **THEN** the host prints a missing-dependency notice and aborts before orchestration continues

#### Scenario: Figma UI work invokes implement then verify

- **WHEN** stage execution is implementing UI from a Figma node URL
- **THEN** the host loads `figma-pixel-implement` for export-faithful implement + living spec path, and later verification loads `figma-pixel-verify` for measured pass/fail

#### Scenario: Missing verify report blocks host verification pass

- **WHEN** this run implemented UI from Figma and the living artifact has no Verify section (and no Spec source sibling report)
- **THEN** the host MUST NOT mark the verification stage as passed

#### Scenario: Spec-gap FAIL does not pass host verification

- **WHEN** `figma-pixel-verify` reports FAIL because Spec is missing critical rows after this-run implement
- **THEN** the host MUST NOT mark verification as passed and MUST re-enter `figma-pixel-implement` for the table

#### Scenario: Non-UI bug still requires skills installed

- **WHEN** a user runs `solve-workflow` for a non-UI backend bug and both Figma pixel skills are installed
- **THEN** the workflow proceeds without running implement/verify loops, but if either skill is missing the prerequisite check still aborts

### Requirement: figma-pixel-fidelity SHALL document boundaries with adjacent skills

The skills MUST state that Figma design-context / MCP (plus any Agent-native Figma→code guidance when present) owns structured context retrieval; `design-approval-gate` owns pre-implementation solution approval; `figma-pixel-implement` owns export-faithful implementation + durable living spec; `figma-pixel-verify` owns post-implementation measured alignment and the Verify section. External “taste” / no-design frontend skills MUST NOT override Figma fidelity when a node URL is in scope. Skill prose MUST remain platform-agnostic and MUST NOT treat a single product’s skill id as universal.

#### Scenario: Approval gate remains distinct

- **WHEN** the user has not approved a solution in manual mode
- **THEN** `design-approval-gate` still applies to production edits; having Figma context MUST NOT by itself satisfy design approval

### Requirement: figma-pixel-implement SHALL put theme scope in by default when the design or project has themes

When the Figma file exposes multiple variable modes (for example light/dark) **or** the target project has a theme-switching mechanism (`data-theme` / design tokens / `prefers-color-scheme`), implement MUST treat multi-theme as in scope without waiting for an explicit “dark mode” user phrase: detect theme structure, record a theme inventory, provide per-mode expected values, export design-provided assets per theme, and map theme-varying variables onto the project’s theming mechanism instead of duplicated hard-coded literals. Per-mode values MUST resolve from the design (`valuesByMode`, mode-switched fetch, or per-theme frames). Implement MUST NOT invent the other theme’s values or recolor a single export. When neither the file nor the project has a second theme, implement stays design-faithful to the requested frame/variant without ambient restyle.

#### Scenario: Theme inventory recorded when the project has data-theme

- **WHEN** the user asks to implement a frame and the project already switches `data-theme` with light/dark tokens, and the Figma file has light/dark modes
- **THEN** implement records the mode inventory and builds spec rows carrying per-mode expected values even if the user did not say “dark mode”

#### Scenario: Per-theme values resolve through the design channel

- **WHEN** per-mode expected values are needed and the design channel exposes variable `valuesByMode` (or a switchable file/frame mode or per-theme frames)
- **THEN** implement resolves each mode's value from the design itself and MUST NOT invent the unexposed mode's values

#### Scenario: Per-theme assets use design exports

- **WHEN** theme is in scope and an asset differs between themes
- **THEN** implement exports each theme's asset from its mode/frame and MUST NOT derive the second theme's asset by recoloring a single export

#### Scenario: Theme-varying values map to the theming mechanism

- **WHEN** theme is in scope and the project has a theming mechanism (CSS custom properties / design tokens / `data-theme` / `prefers-color-scheme`)
- **THEN** implement maps theme-varying variables onto that mechanism instead of duplicating hard-coded per-theme literals

#### Scenario: Single-theme file and project stay single

- **WHEN** the Figma file has one mode and the project has no theme switch
- **THEN** implement stays design-faithful to the single requested frame/variant without ambient dark/light restyle or speculative multi-theme expansion

### Requirement: figma-pixel-verify SHALL measure each theme in scope separately

When the spec covers multiple themes, verify MUST identify the running UI's theme-switching mechanism, switch to each theme in scope, and measure per-mode rows under that theme — the same row under different themes is a separate verdict. The report MUST present results per theme, and overall pass requires every measured theme within tolerance. Single-theme specs measure the requested theme only.

#### Scenario: Dark-mode rows measured under dark theme

- **WHEN** the spec carries per-mode color rows and the running UI has a theme switch mechanism
- **THEN** verify switches to dark, measures the dark rows under dark, and reports them separately from the light rows

#### Scenario: Overall status reflects the worst theme

- **WHEN** light rows pass but dark rows drift beyond tolerance
- **THEN** the overall status is not PASS, with the drifting theme identified in the report

#### Scenario: Single-theme verify unchanged

- **WHEN** the spec has no theme dimension
- **THEN** verify measures the requested theme once and reports as before, without theme switching

### Requirement: figma-pixel-verify SHALL fail overall when critical inventory rows are unmeasured

Verify MUST use the implement inventory plus design-spec table as the measurement set. When a JS-eval channel exists, each critical visual row (geometry, type, color, and documented visual states/themes in scope) MUST be measured after switching the running UI into that `state` / `mode`. Overall status MUST NOT be PASS if any critical row is unmeasured, `MISSING-style`, or unaccepted `DRIFT`. `accepted-residual` MAY be used only for an explicit frozen deviation that records owner and reason (for example a documented 18px vs 16px freeze). Listing unmeasured rows only under residuals MUST NOT produce Overall PASS.

#### Scenario: Sampled chrome cannot PASS a full-frame inventory

- **WHEN** the inventory includes welcome spacing relative to the header and verify only measured header padding
- **THEN** the welcome-spacing row is unmeasured and overall status is not PASS

#### Scenario: Hover is measured under hover

- **WHEN** the spec has a chip background row with `state=hover`
- **THEN** verify switches the running UI into hover (or the equivalent documented state) before reading computed style for that row

#### Scenario: Frozen icon size is accepted residual not PASS

- **WHEN** Figma specifies 16px toolbar icons and the project has an explicit freeze at 18px with a recorded owner
- **THEN** that row is `accepted-residual` and MUST NOT be reported as PASS against 16px

### Requirement: figma-pixel-verify SHALL write measurements into the living artifact

Verify MUST read the implement path (`Spec source`). It MUST write actual, verdict, and coverage into the Verify section of that file, or into a sibling report the artifact names. Spec `expected` MUST NOT be overwritten by measured actuals. After a same-run implement, a missing file or missing critical Spec row MUST fail overall and return to `figma-pixel-implement` — MUST NOT silently invent rows and claim the implement handoff complete. Standalone verify (no implement this run) MAY build a minimal spec from Figma but MUST persist it to the same path convention before measuring. Bounded code fixes MUST update measured columns only. Verify MUST NOT edit `figma-pixel-implement` skill prose.

#### Scenario: Drift is written back without changing expected

- **WHEN** Spec expected gap is 8px and the UI measures 12px
- **THEN** Verify records actual 12 and verdict DRIFT and MUST NOT change Spec expected to 12

#### Scenario: Spec-gap after implement returns to implement

- **WHEN** this run implemented from Figma and a critical visual row is missing from Spec
- **THEN** overall is not PASS and the next step is `figma-pixel-implement` completing the table

#### Scenario: Standalone verify persists first

- **WHEN** the user asks for alignment checking with no implement artifact this session
- **THEN** verify persists a minimal inventory+spec to the living-artifact path before measuring

