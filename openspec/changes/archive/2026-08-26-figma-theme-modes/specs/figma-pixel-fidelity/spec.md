# figma-pixel-fidelity Delta

## ADDED Requirements

### Requirement: figma-pixel-implement SHALL support explicit multi-theme scope

When the user explicitly requests light/dark or multi-theme implementation, implement MUST detect the design's theme structure (variable collections with multiple modes, or separate per-theme frames/variants) before building the design-spec table, record a theme inventory, provide per-mode expected values in the spec table, export design-provided assets per theme, and map theme-varying variables onto the project's theming mechanism instead of duplicated hard-coded literals. Single-theme requests keep existing design-faithful behavior (no ambient restyle, no speculative multi-theme expansion).

#### Scenario: Theme inventory recorded on multi-theme request

- **WHEN** the user asks to implement a frame with dark mode support and the file organizes themes as a light/dark variable collection
- **THEN** implement records the mode inventory and builds spec rows carrying per-mode expected values for theme-varying properties

#### Scenario: Per-theme values resolve through the design channel

- **WHEN** per-mode expected values are needed and the design channel exposes variable `valuesByMode` (or a switchable file/frame mode or per-theme frames)
- **THEN** implement resolves each mode's value from the design itself and MUST NOT invent the unexposed mode's values

#### Scenario: Per-theme assets use design exports

- **WHEN** multi-theme scope is explicit and an asset differs between themes
- **THEN** implement exports each theme's asset from its mode/frame and MUST NOT derive the second theme's asset by recoloring a single export

#### Scenario: Theme-varying values map to the theming mechanism

- **WHEN** multi-theme scope is explicit and the project has a theming mechanism (CSS custom properties / design tokens / `data-theme` / `prefers-color-scheme`)
- **THEN** implement maps theme-varying variables onto that mechanism instead of duplicating hard-coded per-theme literals

#### Scenario: Single-theme default unchanged

- **WHEN** no multi-theme scope is requested
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
