# figma-pixel-fidelity — delta

## ADDED Requirements

### Requirement: figma-pixel-implement SHALL mechanically expand spec rows from the fetched node tree

For every fetched visible node, implement MUST mechanically derive spec rows — sampling "key values" MUST NOT stand in for coverage. Each node MUST yield rows for its position (x/y relative to its parent or section) and size; each text node MUST additionally yield its full typography set (font-size, weight, line-height, color, alignment) and its rendered line count when multi-line; each container MUST additionally yield padding, gap, radius, shadow, and the cumulative absolute coordinate chain (each child's offset from the frame origin). Sibling spacing MUST be recorded with `basis` naming the relationship, not only the node's own padding. A fetched node is either covered by spec rows or listed as `out-of-scope` with a reason; silent omission makes the spec incomplete.

#### Scenario: Full typography captured for a text node

- **WHEN** a design text node renders at a given font-size, weight, line-height, and color
- **THEN** the spec table MUST contain rows for all four properties — omitting line-height or weight is a spec gap, not a detail

#### Scenario: Absolute coordinate chain captured

- **WHEN** a container sits at a fixed y offset in the frame and holds two equal-height buttons with a gap
- **THEN** the spec MUST record the container's absolute offset and the sibling gap with basis, so an upstream line-height error is measurable as a coordinate cascade

#### Scenario: Sampling is a spec gap

- **WHEN** a fetched visible node has no spec row and no `out-of-scope` entry with a reason
- **THEN** the spec is incomplete and MUST be completed before handoff to verify

### Requirement: figma-pixel-implement SHALL export per-frame Figma reference images as durable artifacts

Implement MUST export a raster image of every in-scope frame from the design source and store it in the target repo, recording node id, local path, and export scale in the living artifact. These reference exports are the differential-sweep baseline for `figma-pixel-verify`; a missing reference export for an in-scope frame means implement is incomplete.

#### Scenario: Reference export accompanies the living artifact

- **WHEN** implement completes an in-scope frame
- **THEN** the living artifact records a reference-export entry (node id, local path, scale) for that frame and the file exists on disk

### Requirement: figma-pixel-verify SHALL reconcile the spec against the Figma source before measuring

Before any numeric measurement, verify MUST mechanically derive the expected-item list from the Figma source (fetched node-tree data and/or the reference exports) and reconcile it against the Spec table: every expected item MUST be either covered by a spec row or listed as `out-of-scope` with a reason. Gaps MUST be added as new spec rows (which then become rows to measure in this run) or explicitly marked `out-of-scope`. The reconciliation table (expected items / covered / added rows / out-of-scope) MUST be written into the Verify report. Measurement MUST NOT begin before reconciliation completes. When an in-scope frame lacks its reference export, overall is FAIL and control returns to `figma-pixel-implement`.

#### Scenario: Missing rows are added before measuring

- **WHEN** reconciliation finds a text node whose line-height has no spec row
- **THEN** verify adds the row (or marks it out-of-scope with a reason), records it in the reconciliation table, and measures it in this run

#### Scenario: Reconciliation is a gate

- **WHEN** the spec has never been reconciled against the Figma source
- **THEN** verify MUST NOT proceed to numeric measurement or report overall PASS

### Requirement: figma-pixel-verify SHALL run a pixel differential sweep against the reference exports

Verify MUST compare each reference export against this run's implementation screenshot as a same-box side-by-side (and, when the toolchain allows, a per-pixel difference artifact), inspect region by region, and convert every observed difference into either a new measured row or a recorded residual. Differences discovered outside the spec table are the legitimate product of this sweep. The sweep MUST save its artifacts (side-by-side and/or diff images) and cite their paths in the Verify report; for an openable channel without sweep artifacts, overall is not PASS.

#### Scenario: Sweep catches a difference no spec row predicted

- **WHEN** the side-by-side shows an element offset the spec table never recorded
- **THEN** verify adds a measured row for the offset (or records an accepted residual), resolves it, and cites the sweep artifact path in the report

### Requirement: figma-pixel-verify SHALL measure text-line ink geometry for multi-line text nodes

For every multi-line text node in scope, verify MUST measure — in addition to the box — the line count, each line's ink start position (the rendered left edge of its first visible character), the break content (which text ends each line), and any hanging indent or in-line offset, and record them as rows. A box-only reading MUST NOT count as coverage for a multi-line text node's alignment.

#### Scenario: Hanging indent is a measured row

- **WHEN** a two-line instruction renders its second line hanging-aligned to the first line's body text
- **THEN** verify records the second line's ink start offset as a row and compares it against the design value

#### Scenario: Line-break points are part of the evidence

- **WHEN** the design breaks a phrase across two lines at a specific point
- **THEN** verify records the rendered break content and flags a mismatch as a non-pass row

### Requirement: figma-pixel-verify SHALL obtain an independent re-check before reporting overall PASS

Before writing overall PASS, verify MUST obtain an independent re-check — via a fresh-context agent run, a different model, or a blind re-source check that re-derives the expected-item list from the Figma source without consulting the author's Spec table — and MUST record the method, the re-checker identity, and its artifact path in the Verify report. The independence requirement is about the checking context, not a specific tool. When no independent channel is available, verify MUST record the attempted methods and the unavailability reason; the report MUST NOT claim an independent check that did not run.

#### Scenario: Independent check recorded in the report

- **WHEN** verify prepares to report overall PASS
- **THEN** the Verify report contains an `Independent check:` line naming the method and its artifact path, or the recorded unavailability reason

#### Scenario: Same-context self-review is not an independent check

- **WHEN** the author re-reads its own Spec table in the same context and calls it a check
- **THEN** this does not satisfy the independence requirement
