## Context

`clarifying-question-discipline` v1.3.x is the SoT for clarifying. Audit found only `goal-driven-workflow` needs sync: Chinese-only pointer and a restated purpose→constraints→success line. Other clarifying hosts stay as-is in this change.

## Goals / Non-Goals

**Goals:**
- Thin stage-1 touchpoints on `goal-driven-workflow` aligned with clarifying Prefer + Red Flags.
- Update `goal-run` capability requirements accordingly.

**Non-Goals:**
- Mass-edit solve/opsx/jira/write/tech-review/perf.
- Change clarifying skill again.
- Force-remove Chinese locale one-liner (allowed beside English Prefer).

## Decisions

1. **Edit only `goal-driven-workflow/SKILL.md` stage 1 block** — smallest surface for solution 2.
2. **Pointer shape**: English Prefer required; keep optional Chinese locale line under it (user-facing ZH triggers elsewhere remain).
3. **Question step**: "Ask exactly ONE most critical question per turn" + structured/recommend intent; drop embedded priority checklist.
4. **Red Flags**: append multi-question dump + rush-to-answer; keep existing goal-specific flags.
5. **Ship on current feature branch** (`feat/rewrite-clarifying-question-discipline` / PR #270) unless user prefers a separate PR — default same branch to keep clarifying + host sync together.

## Risks / Trade-offs

- [Chinese templates elsewhere in goal-driven remain] → Mitigation: out of scope; iron law 3 exception is for Chinese-only *skills*, goal-driven is English-primary with ZH triggers; stage templates in Chinese are pre-existing.
- [Coupling to PR #270] → Mitigation: change is independently valid; can cherry-pick if #270 merges first.

## Migration Plan

1. Patch SKILL.md stage 1.
2. Land tasks; verify grep (no purpose→constraints chain in stage 1; Prefer pointer present).
3. Sync/archive `goal-run` delta into main specs.
4. Push to PR #270 (or new PR).

## Open Questions

None for solution 2 — user selected.
