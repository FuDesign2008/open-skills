## ADDED Requirements

### Requirement: figma-pixel-implement SHALL record fill ownership and default to transparent

When a node's structured design payload has no readable fill or background, implement MUST record fill ownership as transparent / `none` and MUST NOT assign a solid background solely because a screenshot of surrounding pixels looks filled. A solid background MUST be materialized only when the node itself has a readable fill, or when a focused node read and screenshot evidence both corroborate that the node owns that fill.

#### Scenario: Screenshot-colored region is not a node fill

- **WHEN** a panel node has no readable fill and the screenshot shows color from a parent or sibling
- **THEN** implement records that panel as transparent / `none` and MUST NOT paint a solid background on that node to match the screenshot

#### Scenario: Explicit fill is implemented

- **WHEN** the node exposes a readable fill in the design payload
- **THEN** implement uses that fill (or its mapped token) as `expected` for the background row

### Requirement: figma-pixel-implement SHALL export the outer instance as one asset

For a visible icon, logo, or graphic treated as one visual unit, implement MUST export from the outermost meaningful instance or graphic frame as a single local file referenced by one image (or equivalent). Implement MUST NOT deliver that unit as stacked leaf-path fragments with absolute positioning. If the export channel only yields leaf fragments, implement MUST re-export the outer node as one image before claiming the asset done. Remote design URLs MUST NOT be the shipped source for visible assets.

#### Scenario: Multi-path logo ships as one file

- **WHEN** a logo instance is composed of several vector paths under one instance
- **THEN** the delivered code references one local export of that instance and MUST NOT stack per-path files to rebuild the logo

#### Scenario: Unexportable graphic is blocked

- **WHEN** a visible graphic cannot be downloaded from the design channel
- **THEN** implement marks that area blocked or pending and MUST NOT substitute a hand-drawn, library, or CSS-traced replacement

### Requirement: figma-pixel-implement SHALL reconstruct instance geometry

Implement MUST size and place each in-scope instance from that instance's container geometry and internal offsets. Implement MUST NOT drop an exported asset into a generic icon/button shell (including a 16×16, 20×20, or 24×24 wrapper) unless the Figma instance itself uses that wrapper.

#### Scenario: Odd-sized icon keeps its wrapper

- **WHEN** an icon instance wrapper is 18×22 in Figma
- **THEN** implement uses 18×22 (and the recorded offsets) and MUST NOT normalize it to 16×16 or 24×24

### Requirement: figma-pixel-implement SHALL record text-color provenance from the text node

For each in-scope visible text node, implement MUST record in Spec the node's own readable Figma color variable name when available, plus the raw value, and map `token` to that variable (or the project's equivalent). Implement MUST NOT replace a readable Figma text-color variable with a self-invented semantic alias as the delivered color. If no readable name exists, implement MUST record `raw-only` and use the raw value (or a generated variable that traces to the source node). State-specific text colors MUST be separate rows, not one shared generic text color.

#### Scenario: Readable variable is the CSS reference

- **WHEN** a title text node binds to a readable Figma variable whose resolved name maps to `--text-5`
- **THEN** Spec `token` / `source` records that variable and the delivered color uses that mapping, not a guessed alias such as `--text-strong`

#### Scenario: Raw-only when no name exists

- **WHEN** a text node has a raw color and no readable variable name
- **THEN** implement records `raw-only` for that row and MUST NOT invent a design-token name

### Requirement: figma-pixel-implement SHALL inventory readable annotations without overriding expected

Readable design annotations, comments, and adaptation notes in scope MUST appear as Inventory rows (visual state, adaptation, `blocked`, or `out-of-scope: behavior` as appropriate). Implement MUST NOT invent undocumented hover or theme values from those notes. When a note conflicts with the named Figma node's structured values, `expected` MUST stay on the node and the conflict MUST be recorded as a note or residual.

#### Scenario: Hover note with no variant is inventoried

- **WHEN** an annotation describes hover but the component has no Hover variant and no prototype reaction
- **THEN** inventory records the note (as `no-variant-in-design` or `blocked` as fits) and implement MUST NOT invent hover colors

#### Scenario: Annotation number does not replace the node

- **WHEN** an annotation says gap 12px and the named node's structured gap is 8px
- **THEN** Spec `expected` is 8 and the conflict is recorded; implement MUST NOT change expected to 12

### Requirement: figma-pixel-implement SHALL restore stacking and SVG aspect from the design

Visible overlap, clipping, and floating layers MUST follow the readable Figma instance hierarchy (parent/sibling order) rather than ad hoc `z-index` escalation. SVG assets MUST keep their natural aspect ratio unless a readable design note or instance setting requires deformation.

#### Scenario: Overlay stays a later sibling

- **WHEN** the expanded Figma state shows a dropdown as a later sibling overlay
- **THEN** implement places that overlay according to that hierarchy instead of nesting it under a convenience wrapper that breaks stacking

#### Scenario: SVG is not stretched to fill

- **WHEN** an exported SVG is 24×16 and the slot is 24×24
- **THEN** implement keeps the 24×16 aspect unless the design explicitly requires stretching

### Requirement: figma-pixel-implement SHALL persist an Assets subsection on the living artifact

The living artifact MUST include an Assets subsection (or equivalent table) listing each in-scope visible graphic: Figma node, local path, resolved format/scale, and that the delivered reference is that local file. Missing Assets rows for implemented visible graphics mean implement is incomplete.

#### Scenario: Icon path is on disk in the artifact

- **WHEN** implement exports a toolbar icon to the project
- **THEN** the living artifact Assets subsection records the node, local path, and format before implement is marked complete

### Requirement: figma-pixel-verify SHALL fail invented-fill, fragment-cut, generic-shell, and invented-text-alias defects

When measuring, verify MUST treat as non-PASS (DRIFT, HARDCODED, or an equivalent named verdict) a critical row whose running UI shows: a solid fill the Spec recorded as transparent/`none`; a graphic rebuilt from stacked leaf fragments; a generic wrapper size that does not match instance geometry; a text color delivered via a self-invented semantic alias when Spec recorded a Figma variable; or a visible graphic still on a remote design URL. Verify MUST NOT overwrite Spec `expected`. Verify MUST NOT edit `figma-pixel-implement` skill prose.

#### Scenario: Invented panel fill is not PASS

- **WHEN** Spec records panel background as transparent/`none` and the running UI has a solid fill on that node
- **THEN** that row is not PASS

#### Scenario: Fragment-stacked icon is not PASS

- **WHEN** Spec Assets lists one local export and the running markup stacks multiple leaf files for that icon
- **THEN** that asset row is not PASS
