## Context

`jira-fix-workflow` (~781) and `opsx-jira-fix-workflow` (~557) need Wave-1 thinning plus extraction of post-merge Jira writeback into `jira-status-writeback`, matching the lean pattern already used by solve/opsx-solve hosts.

## Goals / Non-Goals

**Goals:**
- New skill `jira-status-writeback` (two-step API,「已修复」only, host-parameterized comment fields, warn-on-failure)
- Both hosts: declare dependency, thin writeback to pointer + field map
- Wave 1: strip merge Part C/D restatements; env section → mapping only; collapse duplicate quick-ref where safe; move bulky templates / opsx stage-3 field lists to `reference.md`
- Approximate targets: jira-fix SKILL ~420–520; opsx-jira SKILL ~350–450

**Non-Goals:**
- `jira-fix-core` mega-skill; difficulty-gateway / verification-loop extraction
- Changing ensure-tests advisory vs mandatory; stage renumbering; difficulty auto-stop semantics
- Rewriting `jira-read`

## Decisions

1. **Writeback skill is English-body, Chinese triggers** (AGENTS iron rule 3); `user-invocable: false` (host-loaded only) unless standalone debug invoke is useful → **false**, hosts load it.
2. **Comment contract**: skill lists required semantic fields; hosts pass a mapping table in the load call (jira-fix includes analysis report path; opsx includes OpenSpec change path).
3. **Wave 1 edits are surgical StrReplace / section replace**, not full-file rewrite, to avoid accidental behavior loss; verify with line counts + grep for banned restatements.
4. **AGENTS.md skill table**: add `jira-status-writeback` under 类别/依赖 if the summary table is maintained there.
5. **Version bumps**: new skill `1.0.0`; hosts PATCH/MINOR for behavior-contract thin sync (MINOR if deps added → treat as minor).

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Over-delete host-unique gates | Checklist of must-keep items in tasks; diff review of deleted lines |
| reference.md grows too much | Move only templates/field lists; keep orchestration in SKILL |
| Dependency count mismatch in prose | Align “N dependencies” text with frontmatter array length |

## Migration Plan

1. Add `jira-status-writeback` skill first
2. Wire hosts + thin Wave 1
3. Sync main specs on archive
4. Rollback = revert PR

## Open Questions

None blocking.

## Verification Notes

- `openspec validate lean-jira-workflows` — pass
- `npm run lint:skill-description` — 42 skills, 0 errors
- Soft line counts after Wave 1+writeback: `jira-fix` **670** (from 781; soft target 420–520 not fully met — remaining mass is host-unique state/gateway/execute); `opsx-jira` **506** (from 557; soft target 350–450 partially met). Further thinning deferred.
- Grep: no leftover merge Part C crash catalogs; writeback delegated to `jira-status-writeback`
- 【覆盖率门控】本仓库 `coverage-gate: never`
