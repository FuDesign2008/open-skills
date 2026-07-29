## 1. Enrich pr-code-review skill

- [x] 1.1 Rewrite `skills/pr-code-review/SKILL.md` process: eligibility → pin fixed-point → Spec/Standards sources → dual-axis + multi-perspective → severity + confidence ≥80 → strengths → publish; bump version to 1.1.0
- [x] 1.2 Expand `skills/pr-code-review/reference.md`: comment templates, permalink rules, short Fowler smell baseline, optional post-feedback reception pointer
- [x] 1.3 Update `merge-discipline` Part R decision matrix for dual-axis Critical/Important ≥80 clearance (thin wording only)

## 2. OpenSpec main-tree sync (apply-time)

- [x] 2.1 Add `openspec/specs/pr-code-review/spec.md` from change delta (ADDED requirements as living spec)
- [x] 2.2 Apply `merge-discipline` delta into `openspec/specs/merge-discipline/spec.md` (Part R + C→R→D ordering)

## 3. Docs and verification

- [x] 3.1 Run `node scripts/gen-skill-docs.mjs` and confirm `pr-code-review` index row updated
- [x] 3.2 `openspec validate enrich-pr-code-review`
- [x] 3.3 Grep hosts still say A→B→C→R→D where they mention merge-discipline order
