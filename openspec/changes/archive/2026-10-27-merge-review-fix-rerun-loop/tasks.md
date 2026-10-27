# Tasks

## 1. Spec / citation sweep

- [x] 1.1 Grep repo for `until fixed`, Fail-matrix “re-enter from Part A”, and Part R unlock wording; list hits that need sync (iron rule 9)
- [x] 1.2 Confirm delta specs still validate (`openspec validate merge-review-fix-rerun-loop`)

## 2. merge-discipline skill

- [x] 2.1 Update Part R decision matrix: fail → block Part D; fix tip then mandatory re-review until clean; or explicit skip/accept 留痕; clarify A re-entry only when A/B require it
- [x] 2.2 Add until-clean loop + 3-round cap + post-cap pause options (continue one round / accept residual 留痕 / abort) to Part R body
- [x] 2.3 Add 留痕 template for accept-residual (and keep existing skip templates)
- [x] 2.4 Update `reference.md` pre-merge checklist for re-review loop + round cap
- [x] 2.5 Add/adjust `evals/evals.json` case: fail → fix without re-review must not enter Part D; optional cap-pause case

## 3. pr-code-review skill

- [x] 3.1 Update Host contract: Fail → Part R owns re-review-until-clean (or explicit skip); implementing findings alone is not a Part R pass

## 4. Verify

- [x] 4.1 Run `openspec validate merge-review-fix-rerun-loop`
- [x] 4.2 Grep skills for stale “until fixed” Part R unlock wording (expect zero or intentional skip-path only)
- [x] 4.3 Run `npm run lint:skill-description` if frontmatter descriptions changed
