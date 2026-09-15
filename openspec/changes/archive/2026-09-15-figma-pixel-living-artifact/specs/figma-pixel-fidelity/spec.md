# figma-pixel-fidelity Delta

## ADDED Requirements

### Requirement: figma-pixel-implement SHALL persist a living spec in the target repo

Implement MUST write Inventory and Spec sections to a durable path in the **target** codebase. Prefer an existing project Figma/design-spec directory; otherwise `docs/figma/<safe-frame-name>.md`. Default layout is one file with Inventory, Spec, and an empty Verify section. As each visible child section is implemented, implement MUST append matching inventory/spec rows. A session-only table MUST NOT count as complete. Hand-off MUST include the file path.

#### Scenario: Session note is not complete

- **WHEN** implement has code and a chat-only spec table but no target-repo file path
- **THEN** implement is incomplete and MUST NOT claim ready for verify

#### Scenario: Rows append per visible section

- **WHEN** a large frame has Welcome and Composer sections and Welcome is implemented first
- **THEN** the living artifact already contains Welcome inventory/spec rows before Composer is finished

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

## MODIFIED Requirements

### Requirement: figma-pixel-implement SHALL produce a design-spec table mapped to project tokens

Implement MUST build a design-spec table (element × property × Figma exact value × repo token/class × source component) using structured Figma data (variables/defs and metadata as applicable). The table MUST live in the target-repo living artifact (Spec section). Each row MUST include `state` (visual state from the inventory), `mode` when theme is in scope, and **measurement basis** (which parent or sibling the number is relative to — for example gap from header bottom, not only the node’s own padding). Screenshot output MUST be treated as visual reference only—MUST NOT be the sole source of numeric values. Unbound one-off values SHOULD be flagged; hardcoded literals MUST NOT be preferred when a project token exists.

#### Scenario: Spec table accompanies implementation

- **WHEN** implement completes a component or screen slice
- **THEN** a design-spec table covering the changed visual properties MUST be on disk in the living artifact for `figma-pixel-verify`

#### Scenario: Spacing rows name the basis

- **WHEN** a walkthrough or design specifies distance from a named sibling (for example title to 顶部模块)
- **THEN** the spec row records that sibling as `basis` and the Figma-derived expected value for that relationship

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
