## 1. Scaffold

- [x] 1.1 Snapshot Chinese skill files from git `1f7c837` into each `skills/<name>-workspace/skill-snapshot/`
- [x] 1.2 Write/refresh `evals.json` (2–3 prompts) per skill covering trigger + gate/clarify
- [x] 1.3 `openspec validate eval-en-workflow-skills-batch1`

## 2. Run iteration-1

- [x] 2.1 For each skill: run with_skill + old_skill subagents for all evals; save outputs + timing
- [x] 2.2 Draft/update assertions; grade runs; batch summary (`skills/_eval-en-batch1-tools/batch1-benchmark-summary.md`)
- [x] 2.3 Generate eval viewer for human review (`skills/_eval-en-batch1-tools/viewers/*.html`)

## 3. Iterate and close

- [x] 3.1 Apply skill fixes only for clear regressions vs Chinese baseline intent — **none**; sole heuristic with-below-old (`jira-fix-batch` orchestration) is EN removing hardcoded platform loops (intentional)
- [x] 3.2 Re-run failed evals if fixes landed — N/A (no skill body fixes)
- [x] 3.3 User confirms archive / PR
