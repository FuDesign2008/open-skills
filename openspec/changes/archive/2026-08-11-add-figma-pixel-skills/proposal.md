## Why

Official and marketplace Figma→code skills (e.g. Cursor `figma-design-to-code`, openai-curated implement-design) improve context retrieval but do **not** guarantee pixel-level fidelity: completion often stops at “called MCP + eyeball checklist,” with no runtime measurement gate and no ban on post-export CSS `mask` / `currentColor` pipelines that destroy visual parity (documented in `docs/figma-pixel-fidelity-mask-incident.md` and `docs/figma-pixel-fidelity-research.md`). open-skills needs two installable skills—**implement** and **verify**—so agents can enforce export-faithful implementation and measured alignment without hardcoding a single MCP client.

## What Changes

- Add skill `figma-pixel-implement` (user-invocable): Figma→code with ordered workflow, design-spec table, asset whitelist/blacklist (including CSS mask ban), theme-vs-fidelity priority; **must** load official `figma-design-to-code` (or equivalent) before `get_design_context`; **must not** claim pixel alignment complete.
- Add skill `figma-pixel-verify` (user-invocable): consume the spec table; runtime vision + numeric verification (computed styles / box metrics) with bounded loops; structured PASS/DRIFT/HARDCODED/VARIANT/MISSING-style reporting; platform-agnostic “eval JS in the running page” intent.
- Add `reference.md` (and optional scripts) under each skill as needed for tables, checklists, and measurement guidance.
- Update generated skills index after skill addition; keep research/incident docs cross-linked (no internal identifiers).
- Do **not** add these skills as default strong dependencies of `solve-workflow` / `opsx-solve-workflow` (opt-in via triggers / Figma UI tasks).

## Capabilities

### New Capabilities

- `figma-pixel-fidelity`: Behavioral contract for the pair of skills—when they apply, implement vs verify responsibilities, asset/fidelity iron rules, verification honesty, and boundaries vs official Figma design-to-code and `design-approval-gate`.

### Modified Capabilities

- (none)

## Impact

- New directories: `skills/figma-pixel-implement/`, `skills/figma-pixel-verify/` (SKILL.md + references as needed).
- Docs: `docs/generated/skills-index.md` regenerated; research/incident already on branch may land with this change.
- Runtime: requires Figma MCP (and for verify, a channel that can evaluate JS in the running app / browser); no new npm runtime dependency required for v1.
- Authoring: follow skill-creator constraints (English body, Chinese triggers, description ≤1024, platform-agnostic tool intent).
