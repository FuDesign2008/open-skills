## Why

`figma-pixel-implement` already owns export-faithful assets, a living Inventory/Spec, and Figma-node `expected`. Agents still fail in ways the current contract does not name: painting a solid fill because a screenshot looks filled, reassembling leaf vector fragments, dropping icons into a generic 16/20/24 shell, replacing a readable Figma text variable with a self-invented semantic alias, and ignoring readable annotations as inventory sources. A third-party design-to-HTML skill documents those failure modes; this change absorbs only the subset that fits pixel restore into an existing product codebase.

## What Changes

- **Implement** adds short, affirmative rules for: fill ownership (no readable fill → transparent); whole-instance export (one local file, not stacked leaf fragments); instance geometry (use that instance’s size/offset, not a generic icon/button shell); text-color provenance (the text node’s own readable variable, or `raw-only`—do not invent semantic aliases); readable annotations as Inventory sources (conflicts stay notes; `expected` stays the node); stacking from readable instance hierarchy; SVG aspect preserved; optional living-artifact **Assets** subsection (`node → local path → format`).
- **Verify** records matching FAIL / DRIFT reasons (invented fill, fragment-cut, generic shell, invented text alias, remote/non-exported graphic) without overwriting Spec `expected` and without editing implement skill prose from verify.
- **Does not** absorb standalone HTML delivery, Storybook/library provenance protocols, desktop-bridge gates, seven pre-code tables, annotation-overrides-node, or host methodology restatements. Hosts stay thin citations.
- Skill versions PATCH/MINOR as needed (`figma-pixel-implement` / `figma-pixel-verify`); evals for the new gates.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `figma-pixel-fidelity`: implement failure-mode gates (fill ownership, whole-instance export, instance geometry, text-color provenance, annotation inventory, stacking/aspect, Assets subsection) and verify FAIL reasons for those defects.

## Impact

- Skills: `skills/figma-pixel-implement/{SKILL.md,reference.md,evals/evals.json}`, `skills/figma-pixel-verify/{SKILL.md,reference.md,evals/evals.json}`.
- Specs: `openspec/specs/figma-pixel-fidelity`.
- Docs: `docs/generated/skills-index.md` via `gen-skill-docs.mjs`.
- PDCA hosts: no methodology copy; invoke path unchanged.
- Product apps are not changed in this change.
