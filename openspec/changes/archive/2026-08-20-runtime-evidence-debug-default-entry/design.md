# Design: runtime-evidence-debug as the default debug entry

## Context

`runtime-evidence-debug` is the methodology umbrella for runtime debugging, but field usage shows agents (and host workflows) fail to think of it: the instrumentation gate lives behind two lazy-load hops in `analysis-core` §3, referencing workflows' stage-2 output templates have no mandatory slot for it, and its triggers are self-assessment-based with a soft escape hatch. Meanwhile the user's positioning is validated: it is the most general debug skill and should be the family's default entry, composing with scenario skills (browser-debug-toolkit / hybrid-debug / real-device channel enablers).

## Goals / Non-Goals

**Goals**
- Make `runtime-evidence-debug` the default entry whenever runtime observation is needed, via a state-based (not self-assessed) trigger
- Give the analysis-stage gate a mandatory output slot so skipping it is visible
- Tighten the red-loop escape: user-pasted evidence ≠ agent-observed red; unrunnable loops land as explicit user handoffs
- Raise direct-invocation odds with state-based Chinese description triggers

**Non-Goals**
- Not changing `runtime-evidence-debug`'s internal 7-phase lifecycle (its Phase 1 static-first escalation decision stays authoritative)
- Not demoting scenario skills — they keep WHERE/WHICH authority
- Not adding runtime code, hooks, or platform config — Markdown contracts only
- Not restructuring workflow stage numbering

## Decisions

1. **Gate output block lives in `analysis-core` as SoT; workflows keep thin pointers.**
   Why: the repo's thin-reference model; one place to evolve the block's fields; `openspec validate` already guards duplication via the spec's MUST NOT restate rule. Alternative rejected: pasting the block into each workflow's SKILL.md — four copies drift.

2. **Trigger is state-based: "runtime observation is needed" (static stalled / retry / silent failure / before-after verification).**
   Why: self-assessed confidence triggers fail because models overestimate confidence (verified in usage). State conditions are externally checkable. Alternative rejected: keeping confidence-wording and adding more synonyms — same failure mode.

3. **Block enforcement = output-template slot + `{next-stage}` entry condition.**
   Why: models fill structural templates far more reliably than they follow behavioral prose (established pattern in this repo: stage 1/3/5 templates + stop points). Alternative rejected: only rewriting §3 delegation prose — no output-time forcing function.

4. **Red-loop escape tightened to agent-observed red OR explicit user handoff.**
   Why: the old escape ("state clearly why a loop cannot be established") was satisfiable by user-pasted logs. The handoff landing matches `runtime-evidence-debug`'s existing human-AI division (Phase 2-3). Alternative rejected: hard-requiring agent-runnable repro always — some environments genuinely need the user (real devices, login states).

5. **Description: add state-based Chinese triggers within 铁律 7 budget by trimming framework enumerations.**
   Why: triggers users actually say mid-debug (「修了还是不行」「日志正常但行为不对」「偶现」) route better than method names nobody utters. Framework lists in the description serve routing less than trigger phrases do.

## Risks / Trade-offs

- [Agents may still skip the block] → structural slot + `{next-stage}` entry condition is the strongest available forcing function; residual risk accepted and observable (missing block = visible contract violation)
- [Four reference.md edits drift from SoT] → spec forbids restating block fields; thin pointer only; stage-7 verification greps for duplication
- [Description over 1024 chars] → `lint:skill-description` gate blocks commit; trim enumerations first
- [Over-triggering on trivial bugs] → guardrail: default entry fires only when runtime observation is needed; static-first Phase 1 unchanged; "not needed + one-line evidence" is a legal block fill

## Migration Plan

Markdown-only; single PR; rollback = git revert. No data/config migration. Pre-commit regenerates `docs/generated/skills-index.md` automatically.

## Open Questions

None — trigger wording, gate fields, and guardrails were confirmed in discussion.
