# Tasks: archive-before-merge

## 1. merge-discipline Part A

- [x] 1.1 Add Part A (OpenSpec archive association gate) to `skills/merge-discipline/SKILL.md`: association rule (diff OR session-bound `openspec list`), block vs pass-through, no implicit skip on direct merge; order **A → B → C → D** (former A/B/C shifted to B/C/D)
- [x] 1.2 Rewrite Part D Strategy B to recovery-only + 留痕; update intro/description/Integration guide to name Part A
- [x] 1.3 Add eval case(s) for associated-active block and unassociated pass-through; bump skill version minor

## 2. Thin workflow sync

- [x] 2.1 Update opsx-solve-workflow Part order line + reference merge checklist for Part A
- [x] 2.2 Update opsx-jira-fix-workflow: Part order + remove soft「合并后归档」normal path; reference checklist
- [x] 2.3 Update jira-fix-workflow Part order + reference checklist

## 3. Verify

- [x] 3.1 `openspec validate archive-before-merge`
- [x] 3.2 Grep referencing workflows still point at merge-discipline (no duplicated Part A prose)
- [x] 3.3 Regenerate skills-index if description/version frontmatter changed
