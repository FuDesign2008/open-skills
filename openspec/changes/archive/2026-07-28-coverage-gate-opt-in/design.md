## Context

`merge-discipline` Part C currently auto-runs `test-coverage-analyzer` when a merge is imminent and the skill is installed. That default was introduced to prevent silent bypass, but it does not fit every project (e.g. this Markdown skills library). Users want **project preference + per-merge ask** (options 1+3).

Authority stays in `merge-discipline`; `workflow-contract-sync` must stop saying “MUST run analyzer first.”

## Goals / Non-Goals

**Goals:**
- Resolve `coverage-gate: always|never|ask` from `AGENTS.md` then `CLAUDE.md` (first match; unset ≡ `ask`)
- On `ask`, ask every merge before running the analyzer
- Keep skip 留痕; redefine implicit miss as “should-run but did not”
- Update Part C prose, reference checklist, and thin host red-flags if they imply auto-run
- Set this repo’s preference to `never` as a concrete example

**Non-Goals:**
- New preference skill or config file format
- Changing Part A/B/D
- Changing `solve-workflow` advisory coverage tip (still non-gate)
- Building or shipping `test-coverage-analyzer` itself

## Decisions

1. **Preference carrier = `AGENTS.md` / `CLAUDE.md` line**  
   - Match (case-insensitive key): `coverage-gate:\s*(always|never|ask)\b` outside fenced code blocks when practical; if uncertain, accept first clear line match in the file.  
   - Rationale: already the project AI knowledge base; no new schema.  
   - Alternative rejected: dedicated YAML/JSON config (extra format, YAGNI).

2. **Default = `ask` every merge**  
   - Rationale: user choice 1; safest when projects forget to declare.  
   - `always` / `never` honor choice 3 without re-asking.

3. **Implicit miss only when run was required**  
   - Required = `always`, or `ask` after user chose run.  
   - Explicit skip / `never` are not misses.

4. **Host edits stay thin**  
   - Fix wording that assumes auto-run; keep pointers to `merge-discipline`.

5. **This repo `AGENTS.md`**  
   - Add `coverage-gate: never` under a short “Merge” note so local merges stop prompting for useless analyzer runs.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Agents ignore ask and auto-run | Spec + Part C first lines state MUST NOT auto-run under `ask` |
| Preference line buried / mistyped | Document exact key; first-match AGENTS then CLAUDE |
| Hosts still say “must run analyzer” | Sync `workflow-contract-sync` + grep hosts for auto-run language |
| Users think skip = silent miss | Checklist + 留痕 templates distinguish skip vs miss |

## Migration Plan

1. Ship skill + spec archive together on one tip.  
2. Existing projects with no line behave as `ask` (behavior change — **BREAKING** for auto-run default).  
3. Rollback: revert `merge-discipline` Part C and related specs.

## Open Questions

None blocking. Matching inside nested markdown lists is best-effort.

## Verification Notes

- Validate change with `openspec validate coverage-gate-opt-in`.  
- Grep hosts for leftover “默认跑 / 先运行 analyzer” that contradict ask/preference.  
- 【覆盖率门控】本变更合并时按本仓库 `coverage-gate: never`（落地后）或用户显式跳过留痕。
