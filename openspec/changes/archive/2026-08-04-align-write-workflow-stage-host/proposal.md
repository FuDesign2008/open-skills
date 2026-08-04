## Why

`write-workflow` shipped as a thin Intent→Delegate→Wrap-up host. Users need solve-like **manual/auto mode**, **Quick Reference / Path / reference.md**, and a real **source-analysis stage** before drafting—without binding the debug-oriented `analysis-core` skill. Aligning the host to an eight-stage writing PDCA skeleton (方案 3′) makes orchestration consistent with other workflow entries while keeping document methodology in writer skills.

## What Changes

- Restructure `write-workflow` into eight writing-oriented stages (clarify intent → analyze sources → explore writing approach → review approach → outline → execute via writer → verify → retrospect).
- Add `workflow-mode-lifecycle` as a strong dependency; support 「自动模式」/「自动写文档」with host differences: **§1 approval always pauses**; after approval, auto mode may continue through generation without extra host stops.
- Add Quick Reference table, Path Selection (Full / Incremental / Lean mapped to writing depth), and `reference.md` for host output templates.
- Stage 2 is a **writing analysis** stage (read design/PRD/OpenSpec, existence of sources, gap list)—inspired by analysis discipline, **MUST NOT** declare `analysis-core` as a dependency.
- Lightly update `tech-review-doc` to document the auto-mode contract relative to the host (hard gate unchanged).
- Update AGENTS dependency column and regenerate skills-index; bump skill versions as needed.
- Stacks on `feat/add-write-workflow-tech-review-doc` (PR #262) until that lands on main.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `write-workflow`: eight-stage host skeleton, mode lifecycle, path selection, writing-analysis stage, reference.md; add `workflow-mode-lifecycle` dependency.
- `tech-review-doc`: document host auto-mode interaction; §1 hard gate remains mandatory.

## Impact

- `skills/write-workflow/SKILL.md`, new `skills/write-workflow/reference.md`
- `skills/tech-review-doc/SKILL.md` (small contract note)
- `AGENTS.md`, `docs/generated/skills-index.md`
- `openspec/specs/write-workflow`, `openspec/specs/tech-review-doc`
- Does not modify `solve-workflow` or add `analysis-core` / debug-skill dependencies
