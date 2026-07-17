---
name: clarifying-question-discipline
version: "1.0.0"
user-invocable: false
description: "Hard discipline for asking the user clarifying questions: ask exactly ONE most critical question per round (priority: purpose → constraints → success criteria), and resolve multiple unknowns across MULTIPLE rounds — each round's question refined by the previous answer (not 'only one question for the whole session'). Also carries the investigation-first principle. Referenced via frontmatter dependencies by workflow skills (solve-workflow, opsx-solve-workflow, jira-fix-workflow, opsx-jira-fix-workflow, perf-workflow); load when a workflow delegates user-questioning guidance."
---

# Clarifying Question Discipline

> Internal shared skill. Referencing workflows declare it in frontmatter `dependencies` and abort at startup if it is missing — no silent fallback.

## The hard discipline: one question per round, multiple rounds until clear

When information is insufficient to guarantee output quality, ask the user **exactly ONE most critical question per round**, then wait for the answer before continuing (or asking the next one).

- **Priority order for picking the question**: purpose → constraints → success criteria.
- **Multi-round by design**: when several unknowns exist (purpose, constraints, success criteria all missing), resolve them across **multiple rounds** — each round's question is refined by the previous answer. This discipline does NOT mean "only one question for the whole session"; it means one question per message, iterating until the information is sufficient.
- **Unconditional**: this discipline does NOT depend on whether any enhancement skill (e.g. brainstorming) is detected. It applies in every environment.

**Forbidden**: asking multiple questions in one message, or listing several open points for the user to answer one by one.

**Why**: multi-question dumps increase user cognitive load, cause missed answers, and diffuse the AI's focus. One-at-a-time converges progressively — each question is refined by the previous answer.

## Question format

Describe intent; the agent picks its own native capability (platform-agnostic, per repo rules):

- Prefer the agent's **native structured-question capability** (single question + multiple options); fall back to plain prose when unavailable.
- Do NOT hardcode a platform-specific tool, and do NOT enumerate "platform X uses tool A, platform Y uses tool B".

```
[One sentence stating the question clearly]
- A option one
- B option two
```

**Short-answer convention**: the user may reply with just an option letter ("A", "B"); parse it and continue.

## Investigation-first principle

1. **Investigate before speaking** — for uncertain questions, investigate first, then advise. No investigation, no say.
2. **Evidence over assumptions** — speak with data, facts, and evidence; avoid void hypotheses.

## Integration guide (for referencing workflows)

A referencing workflow keeps exactly three touchpoints in its own body (per spec `clarifying-question-discipline`); the full discipline text lives only here:

1. **Prominent pointer** — a bold/tagged one-line declaration (e.g. "⚠️ Ask one question at a time — see `clarifying-question-discipline`"), not buried in a plain paragraph.
2. **Entry-point quantity constraint** — at each user-questioning step (e.g. "list open questions"), explicitly state "if asking the user, ask only ONE most critical question; ask the next only after the answer".
3. **Red Flags entry** — "dumping multiple questions/open points on the user at once" listed as forbidden, with the one-at-a-time fix.

Skills that do NOT declare the dependency (e.g. standalone English skills) instead inline the full form themselves (prominent declaration + entry constraint + Red Flags + platform-agnostic phrasing).
