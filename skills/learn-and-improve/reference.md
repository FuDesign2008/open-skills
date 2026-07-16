# Learn and Improve — Reference

Detailed methodology for each step of `learn-and-improve`. Read the relevant section when a step's judgment is ambiguous — you do not need all of it every invocation.

## Contents

1. [Retrospective formats — when to use which](#1-retrospective-formats)
2. [Sediment value decision tree](#2-sediment-value-decision-tree)
3. [Carrier selection decision tree](#3-carrier-selection-decision-tree)
4. [Single-loop vs double-loop learning](#4-single-loop-vs-double-loop-learning-argyris)
5. [SECI Externalization — what sediment really is](#5-seci-externalization--what-sediment-really-is)
6. [Effectiveness validation — designing retrieval](#6-effectiveness-validation--designing-retrieval)
7. [Anti-pattern catalog (expanded)](#7-anti-pattern-catalog-expanded)

---

## 1. Retrospective formats

Three formats, picked by context — never by habit.

### Stop-Start-Continue (SSC)
- **Use when**: light check-in, new team, short cycle, the work was routine.
- **Three questions**: what should we **start**? **stop**? **continue**?
- **Strength**: fast, action-oriented, low ceremony.
- **Failure mode**: goes stale if used every cycle — becomes a ritual with no insight. If the last two SSCs produced similar lists, switch formats.

### KPT (Keep / Problem / Try)
- **Use when**: problem-driven work; you want to surface issues and generate experiments.
- **Keep** (effective practices), **Problem** (what failed), **Try** (proposed experiments).
- **Strength**: separates "what happened" from "what to try next"; the Try column turns problems into experiments.
- **Failure mode**: weak action tracking — pair each Try with an explicit owner.

### After-Action Review (AAR)
- **Use when**: significant event — post-project, post-incident, post-release-with-issues.
- **Four questions**: What was **intended**? What **actually** happened? Why the **gap**? What to **change / sustain**?
- **Strength**: forces comparison against intent; the "gap" question surfaces assumptions that SSC skips.
- **Failure mode**: heavier process — overkill for trivial work.

### Choosing
| Situation | Pick |
|-----------|------|
| Routine short cycle | SSC |
| Problem-heavy, want experiments | KPT |
| Major incident or project | AAR |
| Last retrospective felt stale | switch format |

### 5Why (root-cause deepening)
Layered on top of any format when a non-trivial failure appears. Ask "why" up to ~5 times until the cause shifts from symptom to system. Stop early if you hit a root cause — do not force 5 layers on a shallow issue.

---

## 2. Sediment value decision tree

Three gates; pass all three to be a candidate for long-term sediment.

```
Candidate lesson
   │
   ▼
Q1: Will this recur in future work?
   │ no  → one-off summary doc only. STOP.
   │ yes ▼
Q2: Verified in ≥2 distinct scenarios?
   │ no  → HOLD (mark "unverified, re-check next time"). Do not write as a rule yet.
   │ yes ▼
Q3: Team/engineering-level, not personal preference?
   │ no  → personal preference; keep individual, do not impose. STOP.
   │ yes → ✅ Candidate for long-term sediment → go to §3 Carrier selection
```

**Boundary cases**:
- A lesson true in one project but tech-stack-specific → still must pass Q1 ("will *our* future work hit it?", not "does it exist elsewhere").
- A "best practice" from a blog, never validated locally → fails Q2; hold until verified by the team.
- A convention only one member prefers → fails Q3 even if well-argued.

---

## 3. Carrier selection decision tree

Pick by **audience × longevity × change-frequency**.

```
Solidified lesson (passed §2)
   │
   ▼
Audience?
   │ team-wide, all AI tools, long-term engineering rule      → AGENTS.md
   │ Claude Code-specific behavior / workflow preference      → CLAUDE.md
   │ Cursor-specific rule / file-pattern guidance             → .cursor/rules/
   │ stable reusable workflow/domain knowledge, triggerable   → project skill (skills/<name>/)
   │ one-off retrospective / background record                → summary doc
```

**Decision signals**:
- **Audience**: who/what must honor this? Determines the file.
- **Longevity**: permanent convention or temporary? Permanent → AGENTS.md/skill; temporary → summary doc.
- **Change-frequency**: will it evolve often? High-churn → skill (versioned, editable); stable → AGENTS.md.

**Guardrail**: writing to `AGENTS.md` / `CLAUDE.md` / `.cursor/rules/` is a one-way door. Wait for an explicit user request before writing. The default is to **recommend**, not to write.

---

## 4. Single-loop vs double-loop learning (Argyris)

- **Single-loop**: detect an error, correct it within the existing goals/assumptions. "We did X wrong; next time do X correctly." Like a thermostat — adjusts the action to hit the set target.
- **Double-loop**: the error triggers questioning the goals/assumptions themselves. "Why did we set that target / assume X was right? Should the target itself change?" Transformational, not merely corrective.

**When to push double-loop**:
- The same failure recurs across projects (single-loop fixes are not holding).
- The real "lesson" is a wrong assumption ("we assumed the user wanted X").
- A goal was missed and the goal itself may have been wrong.

**How**: after the single-loop fix, ask "and why did we assume the premise behind this?" If the premise is questionable, the deeper lesson concerns the assumption, not the action.

---

## 5. SECI Externalization — what sediment really is

SECI (Nonaka & Takeuchi) models four knowledge conversions. The one relevant here is **Externalization** — tacit → explicit: turning "gut feel / hard-won experience" (tacit) into "written rule / checklist / skill" (explicit).

Not all tacit knowledge should become explicit:
- Recurring + verified + shared → worth externalizing (becomes a rule or skill).
- One-off or personal → keep tacit (stays individual judgment; at most a summary doc).

Over-externalizing — writing every intuition into rules — pollutes shared conventions with noise. The sediment-value decision tree (§2) is the filter that decides what is worth externalizing.

---

## 6. Effectiveness validation — designing retrieval

A sediment item with no retrieval path is "captured but not applied". For each item passing §2/§3, define how it gets reused:

- **Trigger-based**: a future event or skill will invoke this. (e.g. "this lesson lives in solve-workflow phase 1.2, which runs on every problem.")
- **Checklist / guard**: a manual or CI check enforces it. (e.g. "add to PR checklist", "add a lint rule".)
- **Skill-embedded**: baked into a skill the team uses, so it is applied automatically when the skill runs.

If you cannot define a retrieval mechanism, the sediment is likely dead-on-arrival — either make it retrievable or demote it to a summary doc.

---

## 7. Anti-pattern catalog (expanded)

1. **Vague "what went well / what didn't"** — no framework; produces shallow, forgettable lists.
2. **Over-generalization** — turning a one-off coincidence into a rule. Fails §2 Q1/Q2.
3. **Writing unverified guesses into long-term rules** — pollutes `AGENTS.md`/`CLAUDE.md`; verify in ≥2 scenarios first.
4. **Captured but not applied** — sediment with no retrieval path (§6). The dominant failure PMI identifies.
5. **Single-loop only** — fixing the action when the assumption was wrong (§4).
6. **Format mismatch** — SSC for a major incident, AAR for a trivial tweak. Pick by context.
7. **Integration-mode overreach** — in a host workflow, taking over stage orchestration. You own *how to reflect*; the host owns the stage sequence.
8. **Externalizing everything** — writing every intuition into rules (violates §5; pure noise).
9. **Sediment then forget** — never revisiting whether a solidified rule is still used/valid. Periodically prune rules with zero retrieval.
