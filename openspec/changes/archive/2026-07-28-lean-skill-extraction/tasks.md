## 1. Wave 1 — Thin-reference debt cleanup

- [x] 1.1 Collapse merge-discipline Part A–D expansions to one-line pointers in `jira-fix-workflow`, `opsx-solve-workflow`, `opsx-jira-fix-workflow`
- [x] 1.2 Remove learn-and-improve four-step copy from `solve-workflow` / `opsx-solve-workflow` review/Act sections; keep host-only orchestration
- [x] 1.3 Compress clarifying-question restatements in four PDCA workflows to three-touchpoint pointer
- [x] 1.4 Remove node-version probe-chain paste from hosts; call `node-version-discipline` only
- [x] 1.5 Grep residual: host bodies must not expand Part A OpenSpec bullets / SSC-KPT lists / `.nvmrc`→CI chains (except inside authoritative skills)

## 2. Wave 2a — pdca-review-orchestration

- [x] 2.1 Create `skills/pdca-review-orchestration/SKILL.md` (+ reference if templates >5 lines) with placeholders, solution-review + code-design-review contract, loops, design summary, verification honesty
- [x] 2.2 Thin-ref review stages in four PDCA workflows; delete duplicated binary-conclusion / blocking-guide / honesty blocks
- [x] 2.3 Add frontmatter dependencies: hosts → orchestration; orchestration → solution-review, code-design-review
- [x] 2.4 Confirm `opsx-solve-workflow` no longer uses shortened four-dimension inline review as substitute for solution-review

## 3. Wave 2b — openspec-workspace-gates

- [x] 3.1 Create `skills/openspec-workspace-gates/SKILL.md` (locate root, openspec dir, exact OPSX skill names, CLI-not-degrade rules)
- [x] 3.2 Replace `opsx-solve-workflow` stage-0 gates 0–2 with thin ref
- [x] 3.3 Replace matching locate/OPSX checks in `opsx-jira-fix-workflow` stage 0; keep Jira/Git/retry binding in host
- [x] 3.4 Add frontmatter dependencies on both opsx workflows

## 4. Wave 2c — ensure-tests modes

- [x] 4.1 Add `mode=advisory|mandatory` to `skills/ensure-tests/SKILL.md`
- [x] 4.2 `solve-workflow` / `jira-fix-workflow`: remove inline decision tree; call advisory mode
- [x] 4.3 `opsx-solve-workflow` / `opsx-jira-fix-workflow`: remove inline tree; call mandatory mode

## 5. Verify

- [x] 5.1 Run `node scripts/gen-skill-docs.mjs` and include `docs/generated/skills-index.md`
- [x] 5.2 `openspec validate lean-skill-extraction`
- [x] 5.3 Residual greps per design acceptance (review二级制 full blocks, Part expansions, honesty duplicates)
