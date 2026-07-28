## Context

Batch-1 migrates six Chinese-majority workflow skills to English bodies with lean refactor. Full skill-creator eval loops are deferred. Shared methodology must stay thin-referenced (`analysis-core`, clarifying, merge-discipline, etc.).

## Goals / Non-Goals

**Goals:**
- English-primary bodies/references for the six skills; Chinese triggers retained.
- Lean: no re-copy of shared skill prose; templates >5 lines in reference.
- Light verify: CJK ratio drop, frontmatter OK, `openspec validate`, spot-check triggers.

**Non-Goals:**
- Full eval rings; migrating perf/git/merge/`article-writer`; rewriting OpenSpec native skills under `.claude/skills`.

## Decisions

1. **Translate+lean in place** — rewrite each `SKILL.md`/`reference.md` rather than invent new stage models; preserve stage gates and dependency names.
2. **Quoted Chinese OK** — keep slogans/triggers as quoted strings inside English prose.
3. **No workflow-contract-sync delta unless behavior text changes** — language-only + dedupe should not alter MUST contracts; add delta only if a host rule changes.
4. **Order** — smaller batches first (`jira-fix-batch`, `opsx-jira-fix-batch`), then hosts (`solve` → `opsx-solve` → `jira-fix` → `opsx-jira-fix`) to establish voice.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Accidental behavior drift while lean-editing | Diff against openspec host requirements; review checklist per skill |
| CJK remains high due to many quoted slogans | Measure body excluding frontmatter; allow quoted triggers; target instructional prose English-primary |
| PR too large | Single batch as agreed; follow-up batches separate |

## Migration Plan

1. Implement six skills on feature branch.
2. `node scripts/gen-skill-docs.mjs` if descriptions change.
3. Validate + CJK report.
4. Archive OpenSpec change; PR; later change for skill-creator eval loops.

## Open Questions

None blocking for batch-1.
