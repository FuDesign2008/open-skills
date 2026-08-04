## Context

open-skills already hosts PDCA workflows for code problems. This change adds a parallel **document-writing** host and the first writer skill, adapted from an external `design-to-tech-review` skill. Constraints: AGENTS.md iron laws (English body + Chinese triggers, no platform/tool hard-coding, skill-creator quality bar, description ≤1024), skill-naming taxonomy (`-workflow` host + verb-phrase utility), and confirmed scope (no `solve-workflow` edits; no humanizer).

## Goals / Non-Goals

**Goals:**

- Ship `write-workflow` as a thin, extensible orchestration entry.
- Ship `tech-review-doc` (+ Chinese `template.md`) with §1 approval gate and clarifying-question discipline.
- Provide `/write` command and inventory/index updates.

**Non-Goals:**

- Integrating `humanizer-zh` or other writers beyond an extension note.
- Wiring write into `solve-workflow` / Jira hosts.
- Changing OpenSpec native skills or runtime plugins.

## Decisions

1. **Thin host + child skill (not inlined)** — Keeps future writers (humanizer, etc.) as separate skills with a route table in the host. Rejected fat-host and “child-only” options (user-confirmed).
2. **Stage model mirrors source Steps 0–5, not solve’s eight-stage PDCA** — Writing gates (§1 approval, conditional §3/§6) do not map cleanly to analyze/explore/review/plan. Host stages: startup check → intent/route → delegate to writer → output checklist. Writer owns the five-step body.
3. **Replace external `brainstorming` with `clarifying-question-discipline`** — Satisfies iron law 6 and matches existing repo patterns; §1 hard gate stays in `tech-review-doc`.
4. **Both skills `user-invocable: true`** — Host for “写文档”; child for direct “生成技术评审文档”.
5. **Template stays Chinese; SKILL bodies English** — Audience-facing review docs are Chinese; LLM instructions stay English for accuracy (iron law 3). Not classified as a Chinese-only skill like `article-writer`.
6. **Author via skill-creator constraints without full eval harness in this change** — Draft quality + description lint + index gen; optional eval can follow in a later change if trigger accuracy needs tuning.
7. **Opsx artifacts are SoT for behavior** — proposal/specs/design/tasks then archive into `openspec/specs/`.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Trigger collision with `article-writer` / solve phrasing | Distinct Chinese triggers (技术评审文档 / 写文档工作流); Do NOT use boundaries in descriptions |
| Host too thin → agents skip §1 gate | Gate lives in `tech-review-doc` (authoritative); host only reminds to load and follow it |
| Template drift from SKILL rules | SKILL points to template as SoT; success checklist references template sections |
| Future humanizer license/content mismatch | Out of scope; extension slot only |

## Migration Plan

- Additive only: new skill dirs + command + docs.
- Rollback: delete new dirs/command and revert AGENTS/index (or revert the merge commit).
- No data migration.

## Open Questions

- None blocking. Optional later: eval harness for write-workflow triggers; thin optional pointer from solve after solution approval.

## Design summary (post-review)

- **Goals**: extensible write host + tech review doc skill
- **Non-goals**: humanizer, solve wiring
- **Decisions**: thin host; writer-owned five steps; clarifying-question-discipline; EN body / ZH template
- **Risks**: trigger overlap, gate bypass — mitigated as above
- **Open**: none blocking
