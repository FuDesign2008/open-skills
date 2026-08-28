# Delta: code-design-review

Layer reorder enters the behavioral contract. MODIFIED blocks are full copies with Layer B→Layer A renames applied; the ADDED requirement fixes the importance ordering.

## ADDED Requirements

### Requirement: Layers SHALL be presented in importance order with architecture first

`code-design-review` MUST order its layers by importance — architecture-level quality attributes (Layer A) first, code-level design metrics (Layer B) second, security pass (Layer C) last — across the skill body, application steps, output template, and reference doc, so reviewer attention lands on architecture and long-term maintainability before code-level craft. Layer ordering governs presentation and attention; each layer keeps its own applicability rule (Layer A scales full/quick by scope; Layer B runs for every code change; Layer C on trust boundaries).

#### Scenario: Report leads with architecture

- **WHEN** a code-design-review report is produced for a boundary-crossing solution
- **THEN** the architecture (Layer A) section appears before code-level (Layer B) metrics in the report structure, and the review addresses architecture attributes before itemizing code metrics

## MODIFIED Requirements

### Requirement: code-design-review SHALL weight long-term architecture over mere near-term adequacy

When reviewing a proposed code-affecting solution, `code-design-review` MUST treat architectural elegance and long-term maintainability as first-class pass criteria, not optional polish. The skill MUST document that low implementation cost (including AI-assisted coding) does **not** justify accepting a design that is only "good enough for now" when a clearly superior structure is identified and feasible in the same change scope.

#### Scenario: Superior feasible architecture blocks pass

- **WHEN** Layer A (or equivalent architecture assessment) identifies a clearly superior modular/dependency design that is feasible within the current change scope and materially improves long-term maintainability
- **THEN** the review MUST NOT classify that gap as non-blocking solely because the current design is correct and near-term maintainable; it MUST treat the gap as blocking unless the user explicitly accepts documented Prudent-Deliberate debt with a repayment plan

### Requirement: Layer A SHALL be the default depth for non-trivial code solutions

`code-design-review` MUST run Layer A (architecture-level quality attributes) by default for solutions that add modules, change dependency direction, cross module boundaries, or alter public contracts. A "quick path" that skips or lightly skims Layer A MUST be limited to small, isolated changes with no new module boundaries and no dependency-direction impact, and MUST state that limitation in the review report.

#### Scenario: Cross-module change requires full Layer A

- **WHEN** the proposed solution introduces or reshapes module boundaries or dependency direction
- **THEN** the agent runs full Layer A and reports pass/fail per attribute; it does not skip Layer A because the change "looks small"

### Requirement: Layer A SHALL verify capability runtime ownership for boundary-crossing solutions

`code-design-review` Layer A MUST include architecture-boundary verification as checkable sub-items under the dependency-direction dimension as the single source of truth. When the proposed solution crosses process or layer boundaries (e.g. main process ↔ service subprocess, thin shell ↔ product layer), the review MUST answer, with evidence from the codebase: (1) **runtime initialization location** — which process/layer initializes the called capability (FFI handles, databases, caches, service singletons); (2) **boundary legality** — whether the caller can legally reach that capability, including whether a cross-layer static or dynamic import would pull the callee's dependency tree (with existing circular dependencies) into the caller's bundle graph, noting that bundler static pre-scanning makes dynamic `require`/`import` ineffective as a circular-dependency workaround; (3) **ownership classification** — whether the capability is a system capability (belongs in the shell/host layer) or a data/product capability (belongs in the service/product layer), and whether that matches the calling layer's positioning.

The Layer A full-path trigger conditions MUST include "crosses process or layer boundaries" alongside adding modules, changing dependency direction, crossing module boundaries, and altering public contracts; boundary-crossing solutions MUST NOT take the quick path.

The Layer A blocking criteria MUST include: the called capability has no runtime in the caller's process/layer, or a cross-layer import pulls an unrelated dependency tree into the caller, and the solution has not been explicitly accepted as Prudent-Deliberate debt with a repayment plan. Short-term cost advantages (reuse of an existing implementation, single-repo change, no cross-team coordination) MUST NOT downgrade this verdict.

#### Scenario: Boundary check blocks a solution calling an uninitialized-in-caller capability

- **WHEN** a proposed solution has a host/main process directly import a service initialized only in a subprocess, and the review finds no runtime for that capability in the caller
- **THEN** Layer A reports the runtime-ownership violation as blocking (unless explicitly accepted as documented Prudent-Deliberate debt), regardless of the solution's reuse and single-repo advantages

#### Scenario: Dynamic require does not bypass the check

- **WHEN** a solution argues that converting a static cross-layer import into a dynamic `require` inside the call site avoids the dependency-tree spread
- **THEN** the review rejects that argument as a mitigation (bundler static pre-scanning keeps module evaluation order and the bundle graph unchanged) and keeps the boundary violation open

#### Scenario: Boundary-crossing solution takes the full Layer A path

- **WHEN** a solution's diff is small but it introduces a call across a process or layer boundary
- **THEN** the agent runs full Layer A including the runtime-ownership sub-items and does not route it through the quick path
