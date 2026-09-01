# Tasks: jira-fix engine integration

## 1. Skills

- [x] - [x] 1.1 `skills/goal-driven-batch/` (0.9.0): Engine 4-value vocabulary (offer text + Delegate jira-fix branch: Jira-link goal, frozen decisions as stage 0–1 supply, explicit queue-child flag + PR-open terminal, 🔴 → non-blocking failure); frontmatter deps += jira-fix-workflow (opt-in-only abort); reference Task Card Engine line; evals +1
- [x] - [x] 1.2 `skills/jira-fix-workflow/` (3.28.0): frontmatter deps += ai-counterpart-discipline (abort only when policy = counterpart and missing); thin "Queue-child mode" section (input supply / Stage-exit policy semantics / counterpart exits per charter / stop-point forecast / stage-10 short-circuit ONLY on explicit queue-child flag)
- [x] - [x] 1.3 `skills/ai-counterpart-discipline/` (1.2.0): integration-guide PDCA host list += jira-fix-workflow

## 2. Registry & delivery

- [x] - [x] 2.1 `AGENTS.md`: batch deps row += jira-fix-workflow; jira-fix row deps += ai-counterpart-discipline
- [x] - [x] 2.2 Regenerate index; lint --staged; openspec validate; contract greps (4-value vocabulary both sides; queue-child flag + PR-open terminal terms; no standalone-semantics drift)
- [x] - [x] 2.3 Archive; commit; push; stacked PR (base feat/stage-exit-policy)
