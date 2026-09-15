## 1. Evals first (test-first)

- [x] 1.1 Add `figma-pixel-implement` evals for: complete large-frame children, inventory before spec, no invented hover, default theme-in-scope when project has `data-theme`, measurement `basis`, Figma SoT vs conflicting QA
- [x] 1.2 Add `figma-pixel-verify` evals for: unmeasured critical row ⇒ not Overall PASS, hover measured under hover, `accepted-residual` vs silent PASS

## 2. Implement skill

- [x] 2.1 Update `skills/figma-pixel-implement/SKILL.md` workflow (inventory, complete large frames, default theme scope, require verify handoff); bump to 1.2.0; keep description ≤1024 with Chinese triggers
- [x] 2.2 Update `skills/figma-pixel-implement/reference.md` spec-table columns (`state` / `mode` / `basis`) and hand-off checklist

## 3. Verify skill

- [x] 3.1 Update `skills/figma-pixel-verify/SKILL.md` (inventory as measurement set, state/mode switch, fail-closed overall); bump to 1.2.0
- [x] 3.2 Update `skills/figma-pixel-verify/reference.md` report template (coverage, `accepted-residual`)

## 4. Hosts

- [x] 4.1 Tighten `solve-workflow` stage-7 Figma line: missing verify report after Figma implement blocks pass; PATCH version
- [x] 4.2 Same one-liner for `opsx-solve-workflow`, `jira-fix-workflow`, `opsx-jira-fix-workflow` (PATCH versions)
- [x] 4.3 Mirror the bullet in `solve-workflow/reference.md` if present

## 5. Docs and validate

- [x] 5.1 Run `node scripts/gen-skill-docs.mjs`
- [x] 5.2 Run `npm run lint:skill-description`
- [x] 5.3 Run `openspec validate tighten-figma-pixel-coverage-gate`
