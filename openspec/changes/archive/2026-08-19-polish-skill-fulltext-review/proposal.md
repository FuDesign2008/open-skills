## Why

Full-file review after eight evolution rounds found one medium-high and five minor issues, all read-verified: (R1) discipline-table rows embed web-specific implementations (rAF/one-JS-task, document-length delta, page scripts, DOM static copy, hot-reload modules) into the rule body, contradicting the file's own stack-agnostic claim and duplicating Part 4 — blockers for the intended C++ reuse; (R2) Stage 6 lacks a formal Evidence-gate section while the spec names verify a mount point, and discipline 10 lives only in loop step 4 — the single-pass exception (the only legal loop bypass) would skip the between-arms restart rule; (R3) trigger-recognition line still says the frontend chapter is "the working knowledge base" — pre-corpus wording; (R4) the A/B acceptance formula is duplicated verbatim between Stage 6 and loop step 4, violating the repo's rules-once principle; (R5) Stage 5/6 bodies don't point to the Iteration-loop section for colon-direct entrants; (R6, informational) campaign-level vs round-level stop conditions overlap without a cross-reference.

## What Changes

- Discipline-table rows 1/5/6/8/10 rewritten at trap-class intent level (web implementations stay in Part 4 case archive; rows keep their detection principle)
- Stage 6 gains a formal Evidence gate section (disciplines 2, 4, 9, 10); the judge bullet references discipline 10
- Trigger-recognition frontend line reworded to corpus-until-mature (aligns with reference.md reading guide)
- Loop step 4 shortened to reference the Stage 6 rule (formula stated once)
- Stage 5 and Stage 6 each gain a one-line pointer to the "Iteration loop" section
- Stage 6 stop condition gains a cross-reference to the loop's round-level stop conditions
- **Non-goals**: changing discipline semantics or count; changing trigger surface; Part 4 content

## Capabilities

### Modified Capabilities

- `perf-optimize-workflow`: platform-agnostic discipline wording; verify-stage gate section formalized; duplicated rule centralized

## Impact

- Modified: `skills/perf-optimize-workflow/SKILL.md` (~15 lines), main spec after archive
- Behavior: single-pass exception runs under the same discipline-10 rule; C++ readers translate traps, not implementations
- Risk: none structural; wording-only changes verified by grep
