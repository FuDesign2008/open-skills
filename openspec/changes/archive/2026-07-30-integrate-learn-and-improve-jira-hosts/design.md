## Context

`learn-and-improve` is the shared Act-phase skill for PDCA hosts. `solve-workflow` and `opsx-solve-workflow` already strong-depend and thin-delegate it. `jira-fix-workflow` and `opsx-jira-fix-workflow` end at merge/writeback without that dependency; `opsx-jira-fix-workflow` §8.5 only has shallow inline sediment rules.

User confirmed scope: those two Jira hosts only. Solution 2: strong dep + thin refs + update `learn-and-improve` Integrated-by + `AGENTS.md` table.

## Goals / Non-Goals

**Goals:**

- Both Jira hosts abort at startup if `learn-and-improve` is missing.
- Both thin-delegate retrospective at closeout (no methodology restatement).
- Docs (`learn-and-improve`, `AGENTS.md`) stay consistent with frontmatter.

**Non-Goals:**

- `jira-fix-batch` / `opsx-jira-fix-batch`
- Changing `learn-and-improve` methodology body
- Promoting `merge-discipline` on `solve-workflow` (separate change)

## Decisions

1. **Placement — jira-fix stage 10 end** — After writeback / keep-continue, add a short "Retrospective" load line (mirror solve stage 8 thin shape). Alternative: only frontmatter — rejected (declared but never invoked).
2. **Placement — opsx-jira 8.5** — Replace inline sediment with load `learn-and-improve` + OpenSpec carve-out (mirror opsx-solve). Keep order: archive → closeout → merge/writeback → retrospective.
3. **AGENTS.md** — Add `learn-and-improve` to both Jira rows in the dependency table only; no narrative changelog.

## Risks / Trade-offs

- [Environments without `learn-and-improve` abort] → Mitigation: same install hint as other strong deps; intentional parity with solve/opsx-solve.
- [Retrospective adds tokens after every Jira fix] → Mitigation: thin load; skill itself gates writing to long-term carriers on explicit user request.

## Migration Plan

1. Edit the three SKILL.md files + AGENTS.md.
2. Regenerate skills-index if needed (`gen-skill-docs` / pre-commit).
3. Archive OpenSpec change after verify.
4. Rollback: revert the dependency lines and thin blocks.

## Open Questions

- None.
