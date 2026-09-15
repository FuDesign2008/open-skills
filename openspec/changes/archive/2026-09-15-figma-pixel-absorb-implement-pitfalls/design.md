## Context

`figma-pixel-implement` already persists Inventory/Spec and treats the Figma node as visual SoT. Agents still paint screenshot-inferred fills, stack leaf-path fragments, drop assets into generic 16/20/24 shells, and replace readable text variables with invented aliases. This change names those failure modes in the existing two skills. Review lock: the living-artifact **Assets** subsection is **required**, not optional.

## Goals / Non-Goals

**Goals:** Affirmative implement rules for fill ownership, whole-instance export, instance geometry, text-color provenance, annotation inventory (without overriding `expected`), stacking/SVG aspect, and a required Assets subsection; verify FAIL/DRIFT reasons for those defects; evals first; SKILL.md stays short, details in `reference.md`.

**Non-Goals:** Standalone HTML delivery; Storybook/library provenance protocols; desktop-bridge gates; seven pre-code tables; annotation-overrides-node; a checker script with hardcoded token aliases; host methodology restatement; product UI fixes; inventing hover/dark values.

## Decisions

- **Assets MUST.** Proposal said optional; spec and this design require an Assets subsection. Verify uses it to fail fragment-cut / remote URLs.
- **SKILL.md bullets + reference tables.** Avoid a Do-not pile. Template rows for fill ownership, Assets, and text `raw-only` live in `reference.md`.
- **Whole-instance export is an intent**, not a named MCP flag. Agents pick export/screenshot-on-outer-node vs leaf downloads.
- **Annotations feed Inventory only.** Conflicts stay notes; `expected` stays the node (existing SoT).
- **Hosts unchanged.** PDCA one-liners already load implement/verify.
- **Versions:** `figma-pixel-implement` and `figma-pixel-verify` 1.3.0 → 1.4.0. No host PATCH.

## Risks / Trade-offs

- Annotation inventory may still tempt invented hover → Inventory labels `no-variant-in-design` / `blocked`; eval covers it.
- SKILL.md growth → bullets in SKILL, tables in reference; description stays ≤1024.
- Agents ignore Assets subsection → implement incomplete; verify fails fragment-cut / remote URL.

## Migration Plan

Ship via skill files + evals + `gen-skill-docs.mjs`. No data migration. Rollback = revert the skill commit.

## Open Questions

- None blocking. Token-name normalization across design systems stays project-local (Spec `token` column).
