# Delta Spec: code-design-review

## ADDED Requirements

### Requirement: Layer B SHALL verify capability runtime ownership for boundary-crossing solutions

`code-design-review` Layer B MUST include architecture-boundary verification as checkable sub-items under the dependency-direction dimension (dimension 12) as the single source of truth. When the proposed solution crosses process or layer boundaries (e.g. main process ↔ service subprocess, thin shell ↔ product layer), the review MUST answer, with evidence from the codebase: (1) **runtime initialization location** — which process/layer initializes the called capability (FFI handles, databases, caches, service singletons); (2) **boundary legality** — whether the caller can legally reach that capability, including whether a cross-layer static or dynamic import would pull the callee's dependency tree (with existing circular dependencies) into the caller's bundle graph, noting that bundler static pre-scanning makes dynamic `require`/`import` ineffective as a circular-dependency workaround; (3) **ownership classification** — whether the capability is a system capability (belongs in the shell/host layer) or a data/product capability (belongs in the service/product layer), and whether that matches the calling layer's positioning.

The Layer B full-path trigger conditions MUST include "crosses process or layer boundaries" alongside adding modules, changing dependency direction, crossing module boundaries, and altering public contracts; boundary-crossing solutions MUST NOT take the quick path.

The Layer B blocking criteria MUST include: the called capability has no runtime in the caller's process/layer, or a cross-layer import pulls an unrelated dependency tree into the caller, and the solution has not been explicitly accepted as Prudent-Deliberate debt with a repayment plan. Short-term cost advantages (reuse of an existing implementation, single-repo change, no cross-team coordination) MUST NOT downgrade this verdict.

#### Scenario: Boundary check blocks a solution calling an uninitialized-in-caller capability

- **WHEN** a proposed solution has a host/main process directly import a service initialized only in a subprocess, and the review finds no runtime for that capability in the caller
- **THEN** Layer B reports the runtime-ownership violation as blocking (unless explicitly accepted as documented Prudent-Deliberate debt), regardless of the solution's reuse and single-repo advantages

#### Scenario: Dynamic require does not bypass the check

- **WHEN** a solution argues that converting a static cross-layer import into a dynamic `require` inside the call site avoids the dependency-tree spread
- **THEN** the review rejects that argument as a mitigation (bundler static pre-scanning keeps module evaluation order and the bundle graph unchanged) and keeps the boundary violation open

#### Scenario: Boundary-crossing solution takes the full Layer B path

- **WHEN** a solution's diff is small but it introduces a call across a process or layer boundary
- **THEN** the agent runs full Layer B including the runtime-ownership sub-items and does not route it through the quick path
