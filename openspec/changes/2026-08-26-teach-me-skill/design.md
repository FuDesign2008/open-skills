## Context

The dual-track method (rational + intuitive understanding) was proven in two real Q&A sessions about IPC; the record is `docs/concept-explanation-dual-track.md`. The method generalizes to any concept question. The skill must self-trigger from natural phrasings, so `description` quality is the main risk. The source doc and any skill examples must pass the de-identification gate (`lint:deid`, denylist includes the internal product name).

## Goals / Non-Goals

**Goals:**

- Stable dual-track output for concept questions, in the user's language.
- Full repo compliance: 铁律 2 (de-identified examples), 3 (English body + Chinese triggers), 7 (description ≤1024, single-line quoted), and the `skill-naming` spec.
- Light evaluation evidence (one subagent concept-question run + trigger-case review) per the chosen solution path.

**Non-Goals:**

- A `commands/` entry (skill is model-invocable via description).
- The full skill-creator statistical loop (eval viewer, benchmark, description-optimization run_loop).
- Modifying any existing skill; translating the Chinese source doc.

## Decisions

1. **Name `teach-me`** (user-confirmed) — scene-based naming over method-based naming; a verb phrase without a role suffix, compliant with the `skill-naming` taxonomy. Third-party `teach` adjacency is mitigated in the `description`: dual-track concept-Q&A positioning + a Do NOT use line routing hands-on tutorials/onboarding to `teach`.
2. **SKILL.md + reference.md split** — the method lives in SKILL.md (~100 lines); the two worked examples live in reference.md (progressive disclosure, repo 精简原则: long examples out of the body).
3. **De-identification mapping** (applied to both the source doc and reference.md): internal product/app name → "an Electron desktop app" / 某 Electron 桌面应用; internal file names → generic (`main-process.ts`); internal API names → generic (`messenger.sendToServer`); internal feature codename → generic ("offline-rescue" / 保存失败抢救); internal design-decision IDs (D3/D4) → prose; public identifiers (Electron, `ipcMain`, `ERR_NETWORK_IO_SUSPENDED`) kept.
4. **Evidence rule generalized for a global skill** — the original red line ("code evidence must be real file/line") extends to: when the concept has no footprint in the current codebase, use a canonical public example and label it; inventing paths/lines/APIs is a hard failure.
5. **English body, Chinese triggers in description** (铁律 3); single-line double-quoted description, length gated by `lint:skill-description`.
6. **Light evaluation** — one subagent run answering a concept question with the skill, plus a should/should-not trigger review table; the statistical loop is explicitly deferred.

## Risks / Trade-offs

- [Under-triggering on casual phrasings] → mitigation: description lists varied Chinese + English trigger forms; revisit with the full loop if under-triggering is observed in practice.
- [Over-triggering onto tutorial requests] → mitigation: explicit Do NOT use line routing hands-on/onboarding requests to `teach`.
- [Analogy fidelity drift at runtime] → mitigation: fidelity criterion is a named hard rule in SKILL.md and an OpenSpec scenario.

## Migration Plan

1. Scaffold this change (proposal / design / tasks / specs delta).
2. Write `skills/teach-me/SKILL.md` + `reference.md`.
3. De-identify the source doc; update doc indexes.
4. Regenerate skills-index; run `lint:skill-description` + `lint:deid`.
5. Light evaluation.
6. Archive after verify.

## Open Questions

- None.
