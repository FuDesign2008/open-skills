# Design

## Context

Locked with the user: create a lightweight user-invocable skill `html-explain` for explaining MR/PR/diff/local change as HTML. Default path stays light; heavier concept explanation is optional escalation only. Strong dependency is `system-browser-open-discipline` alone.

## Goals / Non-Goals

**Goals:**

- Default pipeline: gather evidence for the change subject → write a five-section lightweight HTML page → open via `system-browser-open-discipline` → chat returns the file path only.
- Escalation ONLY when the subject is mainly a concept/mechanism/protocol shape (not "what this change did"): optionally load `explain-clearly` with form fixed to HTML; this skill still owns system-browser open + chat closeout.
- Strong dependency on `system-browser-open-discipline` with abort-on-missing; do not list `explain-clearly` in frontmatter `dependencies`.
- English skill body; Chinese triggers required in description; deid-safe placeholders (`example.com`).
- Output under workspace `.html-explain/`; new file each run; do not edit gitignore.

**Non-Goals:**

- Replacing or forking `explain-clearly` player/visual rules for concept pages.
- Tutorials (`teach`) or design-doc rewriting (`tech-review-doc`).
- Adding `.html-explain/` to `.gitignore`.
- Hard-coding platform open commands (OS default open intent only, via the discipline skill).

## Decisions

### Default path is lightweight

Most invocations are "explain this MR/diff/change in HTML". The skill gathers enough evidence (MR/PR URL, git diff, local status) and fills five fixed sections. No form choice, no concept-player machinery.

### Escalation is the only heavier path

When the user mainly asks what a mechanism/protocol/architecture shape is (even if an MR is mentioned as context), optionally load `explain-clearly` with form fixed to HTML. Keep browser open + chat closeout here so the user still gets one path and one open.

### Dependencies

Frontmatter `dependencies: [system-browser-open-discipline]` only. Missing dependency → abort with install guidance. `explain-clearly` is optional load at escalation time, not a hard dependency (avoids pulling concept machinery into every light run).

### Output directory

Write to `.html-explain/<topic-slug>-<local-YYYYMMDD-HHmm>.html`. Create the directory when needed. Always a new file; leave prior files in place. Do not modify workspace gitignore.

### Templates live in reference + assets

`reference.md` holds the five-section outline and escalation decision table. `assets/page-shell.html` is a minimal light shell (title, one-liner, five section placeholders). Keep it simple; no heavy explain-clearly player rules.

## Risks / Trade-offs

- [Users confuse with explain-clearly] → Description Do-NOT boundary + escalation table; contract asserts Chinese triggers and that `explain-clearly` is absent from frontmatter dependencies.
- [Missing system-browser skill] → Abort; no silent IDE preview fallback.
- [Deid lint] → Placeholders only (`https://example.com/group/project/-/merge_requests/123`); no internal names/domains/Jira IDs in skill text.

## Migration Plan

Add skill + OpenSpec change + contract test + AGENTS row + regenerate index. Rollback = revert the change commit. No data migration.

## Open Questions

None — design approval locked before implementation.
