## 1. Evals first (test-first)

- [x] 1.1 Add `figma-pixel-verify` eval: quality browser channel ready → use it for hover then computed style
- [x] 1.2 Add `figma-pixel-verify` eval: JS-eval available + screenshot-only comparison ⇒ Overall not PASS; vision may flag composition but does not replace numeric rows
- [x] 1.3 Add `figma-pixel-verify` eval: macOS + ego-browser skill/install path + CLI missing ⇒ MUST install/onboard before measuring; MUST NOT skip to an already-connected weaker MCP

## 2. Verify skill

- [x] 2.1 Update `skills/figma-pixel-verify/SKILL.md`: install-when-possible quality gate; vision supporting; bump to 1.5.0; description ≤1024
- [x] 2.2 Update `skills/figma-pixel-verify/reference.md`: install gate + pointer-state then eval; vision notes

## 3. Docs and validate

- [x] 3.1 Run `node scripts/gen-skill-docs.mjs`
- [x] 3.2 Run `npm run lint:skill-description`
- [x] 3.3 Run `openspec validate figma-pixel-browser-vision-channel`
