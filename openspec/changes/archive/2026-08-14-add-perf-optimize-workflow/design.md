# Design — add-perf-optimize-workflow

## Context

Handoff input `docs/handoff-perf-evidence-discipline.md` (untracked, internal) proposed a nine-discipline evidence skill; stage-2 analysis of the full paradigm (source materials: benchmark log, harness pitfall log, attribution pipeline skill, cross-stack article) established that the paradigm's core increments (harness contract, evidence gate, A/B judge, iteration discipline, loop integration) were absent from both existing skills.

## Goals / Non-Goals

- Goals: two-skill architecture (host + discipline); knowledge layer as the host's `reference.md`; full trigger inheritance; reference re-pointing; opsx traceability.
- Non-Goals: knowledge refresh; other-stack chapters; alias directories; touching archives/history.

## Decisions

1. **Host + discipline split (vs single skill / three-skill family)**: matches repo taxonomy (`-workflow` host, `-discipline` hard gate); discipline reusable by other workflows; host stays lean via delegation. Three-skill (extracting benchmark discipline) rejected: benchmark methodology is tightly coupled to host stage narrative, no second consumer yet (YAGNI).
2. **Knowledge layer inside the host's reference.md (vs standalone knowledge skill)**: decay-rate asymmetry — paradigm ages slowly, knowledge fast; co-locating knowledge in reference.md isolates perishable content to one file with knowledge-only PATCH refreshes; chapter boundaries are pre-cut extraction seams if a stack chapter outgrows. Standalone knowledge skill rejected: cross-skill stage-mapping contract maintenance + dead-skill governance for marginal isolation benefit at one stack.
3. **Dependency direction host → discipline**: the handoff draft's `dependencies: [perf-workflow]` on the discipline was inverted; corrected to follow `completion-evidence-discipline` pattern (discipline declares nothing; host declares discipline). Rationale: gate skills must not depend on the flows they gate (cycle risk, reuse blockage).
4. **Hard cut, no aliases**: repo rename discipline (skill-naming spec) — trigger words fully inherited by the new host, evaluated in trigger eval.
5. **Platform-agnostic wording (铁律 6)**: CDP/React-16 specifics live as intent-level rules + concrete-but-public examples in reference case archive; internal project identifiers anonymized out (铁律 2), deid gate on staged additions.
6. **Unattended loop as weak reference**: ralph-loop is an environment plugin, not a repo skill — integrated as "environmental capability, use when present", never a frontmatter dependency.

## Risks / Trade-offs

- Trigger-routing regression after deletion → mitigated: full trigger inheritance + trigger eval set (workspace) + boundary statements in both descriptions.
- Content loss in the 981-line integration → mitigated: deletion-side diff review; Part 1/Part 2 mapping documented in reference.md reading guide.
- External breakage (published names vanish) → accepted with mitigation: BREAKING CHANGE commit footer → CI MAJOR bump; RELEASE-NOTES migration section.
- Discipline too aggressive (blocks progress) → gate rule scoped: trend-only vs decision-grade, not "discard the number".

## Open Questions

None blocking. Follow-ups logged as non-goals: knowledge refresh; second-stack chapters.
