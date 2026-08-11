## 1. Authoring prep

- [x] 1.1 Skim `docs/figma-pixel-fidelity-research.md` §4 and `openspec/changes/add-figma-pixel-skills/specs/figma-pixel-fidelity/spec.md`; list final Chinese/English triggers for both skills
- [x] 1.2 Confirm skill ids remain `figma-pixel-implement` and `figma-pixel-verify` (or record an approved rename in design.md Open Questions)

## 2. Implement skill (`figma-pixel-implement`)

- [x] 2.1 Create `skills/figma-pixel-implement/SKILL.md` with frontmatter (`name`, `version`, `user-invocable: true`, quoted `description` ≤1024 with Chinese triggers, Do NOT use boundaries)
- [x] 2.2 Write English body: prerequisite official design-to-code + MCP availability gate; ordered workflow; design-spec table; asset whitelist/blacklist including CSS mask ban; theme priority; no pixel-complete claim; platform-agnostic tool intent
- [x] 2.3 Add `skills/figma-pixel-implement/reference.md` for spec-table template, asset rules, and quota/large-frame notes; link from SKILL.md
- [x] 2.4 Run `npm run lint:skill-description` (or project equivalent) on the new description

## 3. Verify skill (`figma-pixel-verify`)

- [x] 3.1 Create `skills/figma-pixel-verify/SKILL.md` with frontmatter (same description constraints; triggers for check/align/验收)
- [x] 3.2 Write English body: consume/extract spec table; preflight; vision + numeric measurement intent; verdict taxonomy; bounded loop (~3); honest degradation without JS-eval; platform-agnostic
- [x] 3.3 Add `skills/figma-pixel-verify/reference.md` for report template and measurement guidance; link from SKILL.md
- [x] 3.4 Run skill-description lint on the verify description

## 4. Docs and index

- [x] 4.1 Regenerate `docs/generated/skills-index.md` via `node scripts/gen-skill-docs.mjs`
- [x] 4.2 Update incident/research “next steps” to point at the two skill ids (no internal identifiers)
- [x] 4.3 Ensure `docs/README.md` already indexes research (adjust only if needed)

## 5. Gates and validation

- [x] 5.1 Run staged deid lint on new/changed skill and docs files (`node scripts/lint-skill-deidentification.mjs --staged` after staging, or path-scoped check)
- [x] 5.2 Run `openspec validate add-figma-pixel-skills` and fix any issues
- [x] 5.3 Smoke-read both SKILL.md files against each ADDED requirement in the delta spec (checklist in PR/verify notes)

## 6. Optional polish

- [x] 6.1 Decide prose-only vs tiny measurement script; if script, add under verify `scripts/` and reference it (default skip)
- [x] 6.2 Light skill-creator-style trigger/eval notes if time permits (can defer to follow-up change)
