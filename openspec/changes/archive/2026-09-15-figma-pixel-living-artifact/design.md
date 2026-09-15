## Context

Coverage-gate change (inventory, unmeasured FAIL, host missing-report) still allowed the spec to live only in chat. This change makes the **target-repo file** the handshake between implement, verify, and PDCA hosts.

## Goals / Non-Goals

**Goals:** Durable Inventory+Spec in the target repo; Verify section is the measured report; spec-gap returns to implement; hosts fail closed on missing path/section; thin host citations.

**Non-Goals:** Product UI fixes; a third `figma-pixel-*` skill; verify auto-editing implement skill markdown; inventing hover/dark values; changing Figma `expected` from measured actuals.

## Decisions

- Path: prefer the project's existing Figma doc dir; else `docs/figma/<safe-frame-name>.md`.
- Default one file, three sections. Sibling verify report allowed when the project already uses one; record Spec source.
- After same-run implement, verify MUST NOT silently rebuild a missing spec. Standalone verify MAY persist a minimal spec first, then measure.
- Hosts keep one-liners (path required / Verify section is the report / spec-gap re-enters implement).

## Risks / Trade-offs

- Agents may still skip the file → hosts treat implement incomplete / verification failed.
- Two-file layouts can drift → Spec source field is required when using a sibling.
