## 1. Trigger shells

- [x] 1.1 Rewrite `skills/jira-fix-batch/SKILL.md` as a thin shell (2.0.0, depends on `goal-driven-batch`, list-enqueue only)
- [x] 1.2 Rewrite `skills/opsx-jira-fix-batch/SKILL.md` as a thin shell (2.0.0, Engine frozen to `opsx-jira-fix-workflow`)

## 2. Queue SoT

- [x] 2.1 `goal-driven-batch` 0.12.0: Jira list-enqueue shortcut + description routing (Jira multi-issue enqueues here)
- [x] 2.2 Relationship pass: derived; no shared branch/change; pass notes to opsx-jira children
- [x] 2.3 `reference.md` Defaults: list-enqueue + derived
- [x] 2.4 evals +2 (list-enqueue no-run; derived no shared change)

## 3. Host pointers

- [x] 3.1 `jira-fix-workflow` Batch section + description (3.30.0)
- [x] 3.2 `opsx-jira-fix-workflow` Batch section + queue-child Related Issues (1.20.0)
- [x] 3.3 `workflow-mode-lifecycle` 1.0.1: orchestrator example is `goal-driven-batch`
- [x] 3.4 `AGENTS.md` skill table: add the two shell rows

## 4. Verify

- [x] 4.1 `npm run lint:skill-description`
- [x] 4.2 `node scripts/gen-skill-docs.mjs` and include `docs/generated/skills-index.md`
- [x] 4.3 Grep: shells do not instruct looping the engines; queue description no longer Do-NOT-use for Jira multi-issue
