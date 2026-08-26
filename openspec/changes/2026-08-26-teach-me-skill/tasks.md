## 1. OpenSpec artifacts

- [x] 1.1 Scaffold change (proposal / design / tasks / specs delta)

## 2. Skill

- [x] 2.1 Write `skills/teach-me/SKILL.md` (English body; single-line quoted description with Chinese triggers; boundary vs `teach`)
- [x] 2.2 Write `skills/teach-me/reference.md` (two de-identified worked examples)

## 3. Source doc & indexes

- [x] 3.1 De-identify `docs/concept-explanation-dual-track.md` in place; record the skill decision in its notes
- [x] 3.2 Add `docs/README.md` index row; AGENTS.md skill-table row
- [x] 3.3 Regenerate `docs/generated/skills-index.md` (teach-me row present)

## 4. Gates & evaluation

- [x] 4.1 `lint:skill-description` → 0 errors for teach-me
- [x] 4.2 `lint:deid` → teach-me files + source doc zero hits (pre-existing legacy hits unchanged, issue #267)
- [x] 4.3 Light eval: subagent concept-question run shows both tracks + no fabricated evidence (subagent stalled; fell back to inline self-run per skill-creator no-subagent path — labeled non-independent evidence)
- [x] 4.4 `openspec validate` — CLI not installed in this env; structure hand-verified against the house format (same as the prior change)
