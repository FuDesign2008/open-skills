# Design: add `tech-research-workflow` skill

## Context

Queue-child run of card `abstract-tech-research-skill` (frozen approach: case abstraction + external-survey fusion, authored via skill-creator constraints, opsx-persisted). Raw material: one real 4-day research engagement case (untracked file, de-identification applies). External survey completed before authoring — see `research-notes.md`; every finding carries an adopted/adapted/not-adopted disposition there. Repo meta-specs bind this work: `skill-authoring-language` (English body, Chinese triggers in description), `skill-dependency-direction` (host→callee edges only), `skill-creator-eval-harness` (lightweight eval batches must cover trigger + gate prompts; full eval loop may be deferred with explicit record).

Stage-4 review record (auto mode, 1 round, non-code light dual-axis):

- **Standards axis** (repo conventions): frontmatter shape matches `known-issue-research` precedent for `dependencies` + abort paragraph; description single-line double-quoted ≤1024 with Chinese triggers + Do-NOT-use boundary (铁律 3/7); English body (铁律 3); platform-neutral intent phrasing for first-hand browser testing (铁律 6); positive phrasing, no version-history notes (精简原则). PASS.
- **Spec axis** (vs card Goal Condition): three-step model / five-step method / evolution curves / incident search → spec R1–R4; reflux → R5; evidence standards → R6; tailoring path → R7; report family → R8; dependency abort → R9; external-research-first satisfied by `research-notes.md`; gates planned in tasks. PASS.
- **Non-blocking notes**: (a) SKILL.md body-length pressure from a rich methodology — mitigated by summary-plus-reference split; (b) trigger neighborhood is crowded (three neighbor skills) — mitigated by description boundary, re-checked at description-optimization step.

## Goals / Non-Goals

**Goals:**

- A `user-invocable` methodology host skill that carries the case-abstracted three-step research model end-to-end, with a lean tailoring path and layered report-family guidance, all de-identified.
- All four mechanical gates green on real runs; OpenSpec change validated and archived.

**Non-Goals:**

- No second skill, no bundling of a doc-conversion script into the distributed skill (pipeline mechanics live as guidance in reference.md; the real converter belongs to the original project, not this repo).
- No full automated skill-creator eval loop in this run (deferred, recorded below).
- No modification to existing skills/scripts/CI.

## Decisions

1. **SKILL.md = methodology summary; reference.md = depth.** SKILL.md carries positioning + prerequisite check + core principle + three-step model + reflux + evidence standards + staged flow (full + lean) + report-family summary + pointers; reference.md carries report templates, a worked de-identified runtime-forensics example, doc-pipeline mechanics, and evolution-curve/incident-search how-to detail. Why: <500-line progressive-disclosure rule; the case's document-pipeline details (markdown→rich-text converter, test-sample triples) are project-shaped, not skill-shaped.
2. **Frontmatter**: `name: tech-research-workflow`, `version: "1.0.0"`, `user-invocable: true`, single-line quoted description ≤1024 chars with Chinese triggers (「技术调研」「竞品调研」「调研报告」…) and Do-NOT-use boundary naming `known-issue-research`, `research`, `tech-review-doc`; `dependencies: [effective-web-research]` with an abort-if-missing paragraph modeled on `known-issue-research`. Alternative considered: no dependency (inline search discipline) — rejected per frozen T2 (repo precedent, single source of search discipline).
3. **First-hand browser testing described by intent** (铁律 6): "operate a real browser session carrying the user's login state, via the agent's native browser capability" — no platform/tool enumeration.
4. **De-identification mapping** (frozen): competitor product → "Competitor A/B"; the product under research → "a multi-platform note product" / "my-project"; real repo paths → generic placeholders (`my-desktop-app/src/main.ts:123` style); real internal platform names → "the team collaboration doc space". The five-step method and evidence kinds are described generically (no real URLs, doc IDs, or bundle filenames).
5. **Staged flow**: intake & scoping (research kind: design-shaping vs single-question) → step 1 self audit → step 2 competitor research → step 3 design mapping → report family assembly → review reflux loop. Lean path: single question → one targeted first-hand check → one-page evidence-linked answer. The reflux loop is written as expected behavior (probe mindset), not an error path.
6. **skill-creator workflow**: full eval tooling (subagent with-skill/without-skill runs, benchmark aggregation, description-optimization loop) is not guaranteed available in this queue-child environment. Escape per card MUST DO 4 + repo `skill-creator-eval-harness` precedent: follow skill-creator's structural constraints manually (frontmatter rules, progressive disclosure, intent capture → draft → test prompts → evaluation → description optimization as a recorded lightweight batch) and defer the full automated loop to a proposed follow-up card. Lightweight batch (recorded in tasks.md): 3 prompts covering Chinese trigger recognition, a boundary no-trigger case, and a stage-order gate case, each with expected behavior and manual assessment.

## Risks / Trade-offs

- [SKILL.md overruns 500 lines from methodology richness] → summary/reference split (decision 1); verify line count at gates.
- [Trigger collision with neighbor skills] → description Do-NOT-use boundary naming all three neighbors; description-optimization step reviews it.
- [De-identification slip: real names from the case entering the body] → mapping table above + `lint-skill-deidentification --staged` gate + manual grep of the two files against case identifiers before commit.
- [Full eval loop deferred] → follow-up card proposed in the completion report; lightweight batch covers trigger + gate behavior per `skill-creator-eval-harness`.
- [Description exceeds 1024 chars] → `npm run lint:skill-description` gate; drafted short, verified mechanically.

## Migration Plan

Additive only: new files under `skills/tech-research-workflow/`, regenerated `docs/generated/skills-index.md`. Rollback = revert the PR.

## Open Questions

None blocking. Follow-up candidates recorded for the queue: full skill-creator eval loop; potential future Chinese-locale report templates (out of scope, English body only).
