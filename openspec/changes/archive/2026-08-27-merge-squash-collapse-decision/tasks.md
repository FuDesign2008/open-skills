## 1. Contract edits

- [x] 1.1 `skills/merge-discipline/SKILL.md` Part D Step 0: insert collapse pre-check (before the numbered steps) + rewrite Step 3 to "Ask only when two viable strategies exist" keeping explicit-choice semantics; relax frontmatter description's "always ask" wording
- [x] 1.2 Sync main spec `openspec/specs/merge-discipline/spec.md` squash-decision requirement with the MODIFIED delta (new pre-check paragraph + two new scenarios)
- [x] 1.3 AGENTS.md 合并偏好 section: update the Part D summary line to mention collapse-to-one-option skip

## 2. Verification & delivery

- [x] 2.1 `openspec validate`; description lint (char limit after wording change); de-identification `--staged`; thin residue grep ("always ask" absent from frontmatter); skills-index regen diff clean
- [x] 2.2 test-suite-ensure statement (markdown-only, logic files = 0), execution report, archive change, commit, push, open PR
