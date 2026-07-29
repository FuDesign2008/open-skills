## Context

Wave 1 (`strengthen-skills-from-superpowers`) landed M1/S1/M2/M3. Wave 2 implements M4 (domain glossary) and S3 (test-first Iron Law) as collision-free shared disciplines, plus an `ensure-tests` boundary requirement so post-hoc coverage is not mistaken for TDD.

## Goals / Non-Goals

**Goals:**
- New `domain-language-discipline` — lazy `CONTEXT.md` glossary; challenge fuzzy terms; orthogonal to OpenSpec
- New `test-first-discipline` — failing test observed before production behavior code; exceptions + delete-if-code-first
- Clarify `ensure-tests` coexistence (post-hoc only)
- Thin host deps/pointers on four PDCA workflows; optional `learn-and-improve` / `AGENTS.md` rows

**Non-Goals:**
- Matt `wayfinder`, Superpowers design HARD-GATE / worktrees / SessionStart bootstrap
- Replacing OpenSpec with CONTEXT.md
- Renaming to `tdd` / `domain-modeling` (external collisions)

## Decisions

1. **Two new skills** (not folding into `ensure-tests` / `analysis-core`) — keeps order vs coverage responsibilities separate (mirrors wave-1 pattern).
2. **Names** = `domain-language-discipline` and `test-first-discipline`.
3. **Host wiring**:
   - Domain: one-line pointer in analysis or clarify stage (read/update glossary when domain language is in play); dependency optional-as-strong on hosts that already load clarifying/analysis — **strong-dep on all four PDCA hosts** for consistency with other disciplines, thin body pointer only.
   - Test-first: strong-dep + one-line in stage 6 (behavior changes); keep ensure-tests call after tasks for coverage/scaffold.
4. **ensure-tests**: ADDED boundary section / requirement only — do not change advisory/mandatory modes.
5. **Language**: English bodies; Chinese triggers in descriptions; platform-agnostic intents.
6. **skill-creator**: Intent captured via OpenSpec; implement drafts + lint/validate (full eval harness deferred unless user asks).

### Stage 4 review — Pass (user confirmed); auto mode for remainder through verification

## Risks / Trade-offs

- [Host misses thin-ref] → Checklist in tasks for four hosts + AGENTS table
- [Name collision with global installs of `tdd`] → Grep forbid those directory names in this repo
- [Over-strict TDD on docs/config] → Exception table in skill
- [CONTEXT polluted with implementation] → Spec + skill forbid implementation details

## Migration Plan

Implement skills → update ensure-tests + hosts → lint descriptions → gen skills-index → openspec validate → stage 7 verify → user confirms archive/PR.

## Open Questions

None blocking.
