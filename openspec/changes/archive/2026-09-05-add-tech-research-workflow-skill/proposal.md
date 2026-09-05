# Proposal: add `tech-research-workflow` skill

## Why

A real 4-day research engagement (case study: HTML content support for a multi-platform note product, 2026-09) produced a reusable technology-research methodology — three-step model (self business audit → competitor first-hand runtime testing → design mapping), a reflux loop (first version = constraint probe), and evidence standards (first-hand > second-hand, file:line pinning, reproducible-evidence sections). That methodology currently lives only in an untracked case file; engineers re-running similar research (adding a content type, adopting a platform capability, choosing between rival designs) have no in-repo workflow to trigger, so research quality depends on individual habit. An external survey (see `research-notes.md` in this change) corroborates the ingredients (spike discipline, design-doc/alternatives-considered practice, RFC feedback rounds, radar-style disposition classification, teardown-style intelligence) and confirms no official-catalog skill covers "technology research → decision-ready report family" (checked 2026-09-05).

## What Changes

- Add `skills/tech-research-workflow/SKILL.md` (v1.0.0, English body, Chinese trigger words in description, `user-invocable: true`, `dependencies: [effective-web-research]` with prerequisite-check paragraph) carrying the case-abstracted methodology: three-step model, competitor runtime forensics (five-step evidence method / evolution curves / same-track incident search), three-tier design mapping, reflux expectation, evidence standards, end-to-end staged flow **with a tailoring path for small single-question research**, and layered report-family guidance.
- Add `skills/tech-research-workflow/reference.md` for depth material that exceeds the SKILL.md summary budget: report-family templates, the document-pipeline details (markdown→rich-text conversion, test-sample triples), and worked micro-examples — all de-identified (generic placeholders only).
- Regenerate `docs/generated/skills-index.md` (mechanical product of `gen-skill-docs.mjs`).

## Capabilities

### New Capabilities

- `tech-research-workflow`: end-to-end methodology skill for technology/competitor research that produces a decision-ready, evidence-bound report family; includes self business audit (asset/hazard inventory with file:line evidence), competitor first-hand runtime testing (five-step evidence method, evolution-curve positioning, same-track incident search), three-tier design mapping (copy / copy-the-idea / explicitly-not-copy with rationale + alternative), reflux (first version as constraint probe, expect one pushback), evidence standards (first-hand > second-hand, reproducible-evidence sections), full staged flow plus a lean tailoring path for single-question research.

### Modified Capabilities

(none — no existing spec's requirements change)

## Impact

- Files added: `skills/tech-research-workflow/SKILL.md`, `skills/tech-research-workflow/reference.md`; regenerated: `docs/generated/skills-index.md`. No existing skill, script, or CI file is modified.
- De-identification red line: all real product/platform/project/path names from the case file are replaced by generic placeholders ("Competitor A", "a multi-platform note product", `my-project`); the repo deid lint gates this.
- Boundary (description-level): distinct from `known-issue-research` (bug-workflow research routing), global `research` skill (single-question source-backed findings file), and `tech-review-doc` (turns an existing design doc into a reviewable doc — downstream of this skill).
