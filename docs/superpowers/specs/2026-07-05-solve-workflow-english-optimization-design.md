# solve-workflow English Migration + Length Reduction

> **Date**: 2026-07-05
> **Skill**: `solve-workflow`
> **Version**: 1.9.0 → 2.0.0
> **Status**: Design approved, implementing

## Problem

1. SKILL.md body is in Chinese — violates AGENTS.md 铁律 3 (English body required)
2. 617 lines — exceeds skill-creator recommended 500 lines
3. Significant content duplication across phases (tool limits, stop points, enhancement hints repeated 7×)

## Solution: Move, Don't Delete

**Core principle: zero information loss.** All content is either consolidated in SKILL.md or moved to reference.md.

### SKILL.md changes (617 → ~489 lines)

| Action | Content | Lines saved |
|--------|---------|-------------|
| Move to reference.md | PDCA correspondence table | 10 |
| Consolidate into 快速参考 | Per-phase tool limitation repeats | 40 |
| Consolidate into global note | Per-phase stop-point repeats | 14 |
| Consolidate into global note | Per-phase 🔌 enhancement repeats | 14 |
| Deduplicate in SKILL.md | Red Flags restating above rules | 20 |
| Move full table to reference.md | 常见错误 (keep non-obvious in SKILL) | 20 |
| Trim LLM-obvious content | 通用原则 common sense | 10 |
| **Total** | | **~128** |

### reference.md changes (94 → ~200-250 lines)

Add:
- PDCA correspondence table (moved from SKILL.md)
- Full 常见错误 table (SKILL.md keeps only non-obvious entries)
- Detailed 通用原则 elaboration

### English migration

- All body → English
- Description: retain Chinese triggers per 铁律 3
- Section headers → English

### Sync markers for Phase 2

Shared sections marked with HTML comments:
```html
<!-- SYNC-SECTION: environment-capability-exploration -->
<!-- SYNC-SECTION: instrumentation-debugging -->
```

### Behavior preservation

**Critical constraint: the rewrite must NOT change execution behavior.**
- All 7 phases' logic stays identical (only translated + consolidated)
- Phase transitions, stop points, tool permissions — all preserved
- Mode lifecycle (auto/manual switching) — preserved
- Environment capability exploration — preserved (shared content)

## Eval Plan

| Eval | Scenario | Baseline |
|------|----------|----------|
| 1 | "分析问题：CSS 布局 bug" — Phase 1 triggering | v1.9.0 snapshot |
| 2 | "自动解决：修复登录失败" — Auto mode + lifecycle | v1.9.0 snapshot |

## Scope

- `skills/solve-workflow/SKILL.md` — full rewrite
- `skills/solve-workflow/reference.md` — expand with moved content
- Version: 1.9.0 → 2.0.0
