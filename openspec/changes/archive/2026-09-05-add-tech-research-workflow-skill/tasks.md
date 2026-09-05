# Tasks: add `tech-research-workflow` skill

## 1. Author the skill (skill-creator constraints, manual mode per design decision 6)

- [x] 1.1 Capture intent record: goal, triggers, output format, boundary vs neighbor skills — append to change dir (`skill-creator-intent.md`)
- [x] 1.2 Draft `skills/tech-research-workflow/SKILL.md`: frontmatter (name/version/user-invocable/description ≤1024 single-line quoted with Chinese triggers + Do-NOT-use/dependencies) + English body: positioning, prerequisite check, core principle, three-step model, five-step runtime forensics, evolution curves, same-track incident search, three-tier design mapping, reflux, evidence standards, staged flow + lean tailoring path, report-family summary with reference.md pointers
- [x] 1.3 Draft `skills/tech-research-workflow/reference.md`: report-family templates, worked de-identified runtime-forensics example, doc-pipeline mechanics (format conversion, test-sample triples), evolution-curve & incident-search how-to detail
- [x] 1.4 De-identification pass: grep both files against case-file identifiers (product/platform/project/path names); apply the design mapping table; zero real-name hits
- [x] 1.5 Lightweight eval batch (3 prompts: Chinese trigger recognition / boundary no-trigger / stage-order gate), record prompts + expected vs observed in `eval-lightweight.md` in the change dir; defer full automated loop per design decision 6

## 2. Mechanical gates (fresh runs, outputs recorded)

- [x] 2.1 `node scripts/gen-skill-docs.mjs` then `git diff --exit-code docs/generated/skills-index.md` shows only the new-skill addition (run once more after final edits; diff must match regenerated state)
- [x] 2.2 `npm run lint:skill-description` passes (description ≤1024)
- [x] 2.3 `node scripts/lint-skill-deidentification.mjs --staged` reports zero new violations for staged skill files
- [x] 2.4 `openspec validate add-tech-research-workflow-skill` passes
- [x] 2.5 SKILL.md line count < 500; body carries no version-history notes; positive phrasing spot-check

## 3. Archive, deliver, report

- [x] 3.1 Sync delta spec into main specs and archive the change via `openspec-archive-change` flow (openspec sync/archive CLI); confirm archive dir + main spec landed in git status
- [ ] 3.2 Commit on `feat/tech-research-workflow-skill` with repo-style prefixes (`feat:` skill + docs index, `docs:` openspec artifacts), push branch
- [ ] 3.3 Open PR against main via `gh`; stop (merge is human-only)
- [ ] 3.4 Completion report: numbered verification checklist with real outputs, decision/assumption ledger, human-judgment items, PR URL, branch tip sha, files created
