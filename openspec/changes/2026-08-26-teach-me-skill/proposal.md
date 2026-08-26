## Why

Concept questions ("what is X", "why does X exist", "can A talk to B") are frequent, but answers lack a stable, teachable structure. Two real Q&A sessions distilled a **dual-track explanation method** — a rational track (one-sentence definition → why it exists → concrete shape in the asker's codebase with real evidence → key design implication) plus an intuitive track (everyday analogy → one-line memory anchor). The raw material lives in `docs/concept-explanation-dual-track.md` (currently untracked and carrying internal identifiers that fail the de-identification gate). This change turns the method into the reusable skill `teach-me` and brings the source doc into compliance.

## What Changes

- Add `skills/teach-me/SKILL.md` — English body; the dual-track method (4-step rational + 2-step intuitive), the analogy-fidelity criterion (analogies may simplify but never contradict key constraints), the evidence rule (real files only; labeled public example otherwise); `description` carries Chinese triggers, English aliases, and the boundary vs the third-party `teach` skill.
- Add `skills/teach-me/reference.md` — two fully worked, de-identified examples (a "what is X" mechanism question and a "can A talk to B" topology question).
- De-identify `docs/concept-explanation-dual-track.md` in place (generic Electron desktop-app placeholders) so the source material can be committed; record the skill decision in its "next steps" note.
- Add a doc-index row in `docs/README.md`; add a category/dependency row to the AGENTS.md skill table.
- Regenerate `docs/generated/skills-index.md` (teach-me row appears).

## Capabilities

### New Capabilities

- `teach-me`: dual-track concept-explanation contract — both tracks always delivered in one answer; analogy fidelity preserved; evidence authentic or explicitly generic; tutorial requests not claimed.

### Modified Capabilities

- (none)

## Impact

- Skills: `skills/teach-me/` (new)
- Docs: `docs/concept-explanation-dual-track.md` (de-identified in place), `docs/README.md`, `docs/generated/skills-index.md`, `AGENTS.md` (skill-table row)
- No runtime code; no existing skill modified
- Out of scope: statistical trigger optimization (full skill-creator loop) — deferred to a later iteration if under-triggering is observed
