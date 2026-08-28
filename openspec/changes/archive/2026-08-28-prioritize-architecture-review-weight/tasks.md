# Tasks: prioritize architecture review weight

## 1. code-design-review restructure (v1.3.0)

- [x] 1.1 SKILL.md: flip description word order (architecture-level first); version 1.2.0 → 1.3.0
- [x] 1.2 SKILL.md: reorder layers — new Layer A = architecture-level quality attributes (items 1–5), new Layer B = code-level design metrics (items 6–12), Layer C unchanged (13); swap application steps and output template order; update blocking annotations "(Layer B, full path)" → "(Layer A, full path)"
- [x] 1.3 reference.md: swap section order + TOC, renumber items (arch 1–5, code 6–12), swap internal cross-references (e.g. Shotgun Surgery overlap note), reorder blocking-criteria blocks and framework source index rows

## 2. Cross-reference hard cut (hosts)

- [x] 2.1 `solve-workflow` (v1.24.1): "code-design-review Layer B dependency-direction dimension" → "Layer A …"
- [x] 2.2 `opsx-solve-workflow` (v1.18.1): same pointer rename
- [x] 2.3 `jira-fix-workflow` (v3.27.1): same pointer rename
- [x] 2.4 `opsx-jira-fix-workflow` (v1.18.1): same pointer rename

## 3. RC1 remediation + staged-review-flow enhancements

- [x] 3.1 `opsx-solve-workflow` stage 4: replace the "never treat 'a better architecture exists…' as blocking" clause with a criteria-ownership pointer to solution-review / code-design-review
- [x] 3.2 `staged-review-flow` (v1.3.0): sharpen code trigger (source files incl. scripts and generated config code) + add long-term-cost depth floor (standard depth regardless of reversibility for code-affecting solutions)

## 4. Verification + archive + delivery

- [x] 4.1 Node 22: `lint:skill-description` + `gen-skill-docs` (index reflects flipped description) + `npm test` all pass
- [x] 4.2 `openspec validate prioritize-architecture-review-weight` + `openspec validate --specs` pass
- [x] 4.3 Residue sweep: `grep -rn "Layer B"` in skills/, AGENTS.md, docs/, openspec/specs/ returns only git-worktree-discipline's own vocabulary (exempt); the "never treat … near-term" clause has zero hits repo-wide
- [x] 4.4 Archive + sync 3 MODIFIED/ADDED capabilities into main specs (incl. code-design-review spec Purpose line Layer B→A)
- [x] 4.5 Commit, push, open PR
