## Why

open-skills has PDCA hosts for fixing and shipping code (`solve-workflow`, `opsx-*`, `perf-workflow`) but no first-class host for **writing technical documents**. Teams currently rely on an external `design-to-tech-review` skill that is not adapted to this repo's conventions (English skill body, Chinese triggers, no hard-coded external `brainstorming` skill). We need an extensible write host plus a first document skill for product/QA-facing tech review docs.

## What Changes

- Add orchestration skill `write-workflow`: thin host that routes writing tasks, enforces clarifying-question discipline, and delegates to document-type skills; leaves extension hooks for future writers (e.g. humanizer) without wiring them in this change.
- Add `tech-review-doc`: migrate and rename external `design-to-tech-review` (including `template.md`); English skill body + Chinese triggers; replace hard dependency on external `brainstorming` with `clarifying-question-discipline` and an explicit §1 user-approval gate.
- Add command entry `commands/write.md`.
- Update `AGENTS.md` skill inventory (category + dependency column) and regenerate `docs/generated/skills-index.md`.
- **Do not** modify `solve-workflow` or other PDCA hosts in this change.
- **Do not** integrate `humanizer-zh` in this change (documented as a future dependency slot only).

## Capabilities

### New Capabilities

- `write-workflow`: extensible document-writing host workflow (route → clarify → delegate → verify output).
- `tech-review-doc`: generate a product/QA-readable technical review document from a design doc, with §1 approval gate, Mermaid overview, conditional sections, and template-based file output.

### Modified Capabilities

- (none)

## Impact

- New dirs: `skills/write-workflow/`, `skills/tech-review-doc/` (incl. `template.md`), `commands/write.md`
- Docs: `AGENTS.md`, `docs/generated/skills-index.md`
- Strong dependency: `write-workflow` → `clarifying-question-discipline`, `tech-review-doc`; `tech-review-doc` → `clarifying-question-discipline`
- No application runtime code; Markdown skills only
