## 1. OpenSpec artifacts

- [x] 1.1 Scaffold change (proposal / design / tasks / specs delta)

## 2. Skill

- [x] 2.1 Write `skills/sms-code-reader/SKILL.md` (English body; single-line quoted description with Chinese triggers; prerequisites; pre-flight checks; core read + freshness gate; pacing; failure-mode table; three ⭐ deep-dives; privacy boundary)
- [x] 2.2 Write `skills/sms-code-reader/evals/evals.json` (four scenarios + assertions)

## 3. Indexes

- [x] 3.1 Regenerate `docs/generated/skills-index.md` (sms-code-reader row present)

## 4. Gates & evaluation

- [x] 4.1 `node scripts/lint-skill-description.mjs` → 0 errors
- [x] 4.2 `node scripts/lint-skill-deidentification.mjs --base origin/main` → no new findings
- [x] 4.3 `node scripts/gen-skill-docs.mjs && git diff --exit-code docs/generated/skills-index.md` → clean
- [x] 4.4 Residual grep for every stripped identifier (the design's strip-scope list; pattern kept in local notes) under `skills/sms-code-reader/` → zero hits
- [x] 4.5 Read-through against the source inventory: mechanism, diagnostics, known boundaries, and all three ⭐ deep-dives present; field numbers faithful; identifiers stripped
- [x] 4.6 `openspec validate` → valid (pre-archive); archive → `openspec/specs/sms-code-reader/` landed

## 5. Delivery

- [x] 5.1 Feature branch `feat/sms-code-reader-port`; commit (`feat:` prefix); push (merge stays human; no PR per the card)
